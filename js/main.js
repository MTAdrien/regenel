import { Application } from "https://unpkg.com/@hotwired/stimulus@3.2.2/dist/stimulus.js";
import NavbarController from "./controllers/navbar_controller.js";
import RevealController from "./controllers/reveal_controller.js";
import CarouselController from "./controllers/carousel_controller.js";
import DiagnosticController from "./controllers/diagnostic_controller.js";

const application = Application.start();
application.register("navbar", NavbarController);
application.register("reveal", RevealController);
application.register("carousel", CarouselController);
application.register("diagnostic", DiagnosticController);
