use axum::{
    Router,
    body::Body,
    extract::{DefaultBodyLimit, Request},
};
use http::{HeaderName, Method};
use sentry::Hub;
use sentry_tower::{NewFromTopProvider, SentryHttpLayer, SentryLayer};
use std::{sync::Arc, time::Duration};
use tower::{
    ServiceBuilder,
    layer::util::{Identity, Stack},
};
use tower_http::{
    classify::{ServerErrorsAsFailures, SharedClassifier},
    compression::{
        CompressionLayer, CompressionLevel, Predicate,
        predicate::{And, NotForContentType, SizeAbove},
    },
    cors::{AllowOrigin, Any, CorsLayer},
    normalize_path::NormalizePathLayer,
    timeout::TimeoutLayer,
    trace::TraceLayer,
};
use tracing::Span;

pub struct CommonTowerLayerBuilder {
    allowed_methods: Vec<Method>,
    allowed_origins: AllowOrigin,
    allowed_headers: Vec<HeaderName>,
    exposed_headers: Vec<HeaderName>,
    compression_level: CompressionLevel,
    compression_size: u16,
    timeout: u64,
    max_size: usize,
    tracing: bool,
    enable_sentry_layer: bool,
    normalize_path: bool,
}

impl CommonTowerLayerBuilder {
    pub fn new() -> Self {
        Self {
            allowed_methods: vec![Method::GET, Method::POST, Method::PATCH, Method::DELETE],
            allowed_origins: Any.into(),
            allowed_headers: vec![HeaderName::from_static("content-type")],
            exposed_headers: vec![],
            compression_level: CompressionLevel::Fastest,
            compression_size: 1024,
            timeout: 30,
            max_size: 1024 * 1024 * 250,
            tracing: true,
            enable_sentry_layer: true,
            normalize_path: true,
        }
    }

    pub fn build(
        self,
    ) -> CommonTowerLayer<impl Fn(&Request<Body>) -> Span + Send + Clone + 'static + Sync> {
        let cors_layer = CorsLayer::new()
            .allow_methods(self.allowed_methods)
            .allow_origin(self.allowed_origins)
            .expose_headers(self.exposed_headers)
            .allow_headers(self.allowed_headers);

        let compression_layer = CompressionLayer::new()
            .quality(self.compression_level)
            .compress_when(
                SizeAbove::new(self.compression_size)
                    .and(NotForContentType::new("text/event-stream")),
            );

        let timeout_layer = TimeoutLayer::new(Duration::from_secs(self.timeout));

        let size_limit_layer = DefaultBodyLimit::max(self.max_size);

        let tracing_layer = if self.tracing {
            Some(
                TraceLayer::new_for_http().make_span_with(|request: &Request<Body>| {
                    tracing::info_span!(
                        "request",
                        user_id = tracing::field::Empty,
                        method = %request.method(),
                        uri = %request.uri(),
                        version = ?request.version(),
                    )
                }),
            )
        } else {
            None
        };

        let sentry_layer = if self.enable_sentry_layer {
            let http_layer = sentry_tower::SentryHttpLayer::new();
            Some(
                ServiceBuilder::new()
                    .layer(sentry_tower::NewSentryLayer::<Request>::new_from_top())
                    .layer(sentry_tower::SentryHttpLayer::enable_transaction(
                        http_layer,
                    )),
            )
        } else {
            None
        };

        let normalize_path_layer = if self.normalize_path {
            Some(NormalizePathLayer::trim_trailing_slash())
        } else {
            None
        };

        CommonTowerLayer {
            cors_layer,
            compression_layer,
            timeout_layer,
            size_limit_layer,
            tracing_layer,
            sentry_layer,
            normalize_path_layer,
        }
    }
}

type CTLCompressionLayer = CompressionLayer<And<SizeAbove, NotForContentType>>;
type CTLTracingLayer<F> = TraceLayer<SharedClassifier<ServerErrorsAsFailures>, F>;
type CTLSentryLayer = ServiceBuilder<
    Stack<
        SentryHttpLayer,
        Stack<SentryLayer<NewFromTopProvider, Arc<Hub>, Request<Body>>, Identity>,
    >,
>;

pub struct CommonTowerLayer<F: Fn(&Request<Body>) -> Span + Send + Clone + 'static + Sync> {
    cors_layer: CorsLayer,
    compression_layer: CTLCompressionLayer,
    timeout_layer: TimeoutLayer,
    size_limit_layer: DefaultBodyLimit,
    tracing_layer: Option<CTLTracingLayer<F>>,
    sentry_layer: Option<CTLSentryLayer>,
    normalize_path_layer: Option<NormalizePathLayer>,
}

impl<F> CommonTowerLayer<F>
where
    F: Fn(&Request<Body>) -> Span + Send + Clone + 'static + Sync,
{
    pub fn apply_middlewares<S: Send + Clone + Sync + 'static>(
        self,
        router: Router<S>,
    ) -> Router<S> {
        let mut router = router
            .layer(self.size_limit_layer)
            .layer(self.timeout_layer)
            .layer(self.compression_layer)
            .layer(self.cors_layer);

        if let Some(layer) = self.normalize_path_layer {
            router = router.layer(layer);
        }

        if let Some(layer) = self.tracing_layer {
            router = router.layer(layer);
        }

        // if let Some(layer) = self.sentry_layer {
        //     router = router.layer(layer);
        // }

        router
    }
}
