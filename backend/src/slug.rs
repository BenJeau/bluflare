pub fn slugify(s: &str) -> String {
    s.to_lowercase()
        .chars()
        .fold(String::new(), |mut acc, c| {
            if c.is_ascii_alphabetic() {
                acc.push(c);
            } else if !acc.ends_with('-') {
                acc.push('-');
            }
            acc
        })
        .trim_matches('-')
        .to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_given_slug_when_slugify_return_unchanged() {
        let s = "hello-world";
        assert_eq!(slugify(s), s);
    }

    #[test]
    fn test_given_data_with_special_characters_when_slugify_return_data_without_special_characters()
    {
        assert_eq!(slugify("hello, world!?"), "hello-world");
    }

    #[test]
    fn test_given_data_with_mixed_case_when_slugify_return_data_in_lowercase() {
        assert_eq!(slugify("Hello, World"), "hello-world");
    }

    #[test]
    fn test_given_leading_and_trailing_spaces_when_slugify_return_data_without_trailing_spaces() {
        assert_eq!(slugify("   Hello    World    "), "hello-world");
    }

    #[test]
    fn test_given_leading_and_trailing_special_characters_when_slugify_return_data_without_special_characters()
     {
        assert_eq!(
            slugify("!)(|}{:\\/Hello__World?|};'098 wow^*"),
            "hello-world-wow"
        );
    }
}
