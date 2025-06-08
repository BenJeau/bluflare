use argon2::{
    Argon2,
    password_hash::{PasswordHasher, SaltString, rand_core::OsRng},
};

fn main() {
    let args = std::env::args().collect::<Vec<String>>();
    if args.len() != 2 {
        eprintln!("Usage: {} <password>", args[0]);
        std::process::exit(1);
    }

    let argon2 = Argon2::default();
    let salt: SaltString = SaltString::generate(&mut OsRng);
    let hash = argon2.hash_password(args[1].as_bytes(), &salt).unwrap();
    println!("Password hash: {}", hash);
}
