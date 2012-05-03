package controllers;

import models.ConnectionHandler;
import org.codehaus.jackson.JsonNode;
import play.mvc.Controller;
import play.mvc.Result;
import play.mvc.WebSocket;
import views.html.aboutGame;
import views.html.chatRoom;
import views.html.index;

public class Application extends Controller {

    /**
     * Display the home page.
     */
    public static Result index() {
        return ok(index.render());
    }

    /**
     * Display the about game page.
     */
    public static Result aboutGame() {
        return ok(aboutGame.render());
    }

    /**
     * Display the game room.
     */
    public static Result chatRoom(String username) {
        if (username == null || username.trim().equals("") || username.contains("%")) {
            flash("error", "Please choose a valid username.");
            return redirect(routes.Application.index());
        }
        return ok(chatRoom.render(username));
    }

    /**
     * Handle the game webSocket.
     */
    public static WebSocket<JsonNode> game(final String username) {
        return new WebSocket<JsonNode>() {

            // Called when the WebSocket Handshake is done.
            public void onReady(WebSocket.In<JsonNode> in, WebSocket.Out<JsonNode> out) {
                // Join the user to the Game.
                try {
                    ConnectionHandler.join(username, in, out);
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
            }
        };
    }

}
