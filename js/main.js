import { Application } from "https://unpkg.com/@hotwired/stimulus@3.2.2/dist/stimulus.js";
import NavbarController from "./controllers/navbar_controller.js";

const application = Application.start();
application.register("navbar", NavbarController);
