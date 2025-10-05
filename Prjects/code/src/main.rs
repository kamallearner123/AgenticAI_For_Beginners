use actix_web::{web, App, HttpResponse, HttpServer, Responder};

async fn home() -> impl Responder {
    HttpResponse::Ok().body("Welcome to the Mentorship Program!")
}

async fn mentor_register() -> impl Responder {
    HttpResponse::Ok().body("Mentor Registration Page")
}

async fn mentee_register() -> impl Responder {
    HttpResponse::Ok().body("Mentee Registration Page")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .route("/", web::get().to(home))
            .route("/mentor", web::get().to(mentor_register))
            .route("/mentee", web::get().to(mentee_register))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
