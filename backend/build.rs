use std::fs;
use std::path::Path;
use std::process::Command;

fn main() {
    let dict_path = Path::new("src/zstd_dictionary");

    if !dict_path.exists() {
        println!("Downloading zstd dictionary...");

        let output = Command::new("curl")
            .arg("-L") // Follow redirects
            .arg("https://raw.githubusercontent.com/bluesky-social/jetstream/main/pkg/models/zstd_dictionary")
            .output()
            .expect("Failed to download dictionary");

        if !output.status.success() {
            panic!(
                "Failed to download dictionary: {}",
                String::from_utf8_lossy(&output.stderr)
            );
        }

        fs::write(dict_path, output.stdout).expect("Failed to write dictionary file");

        println!("Dictionary downloaded successfully");
    }
}
