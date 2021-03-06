package models;

import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.node.ObjectNode;
import play.libs.F;
import play.libs.Json;
import play.mvc.WebSocket;

import java.util.ArrayList;

/**
 * Created by Mart0
 * Date: 4/24/12
 */
public class ConnectionHandler {
    private static ArrayList<GameWhoIsWho> gameList = new ArrayList<GameWhoIsWho>();
    private static ArrayList<GameClassic> classicList = new ArrayList<GameClassic>();
    private static ArrayList<GameCelebrities> celebritiesList = new ArrayList<GameCelebrities>();
    private static ArrayList<GameDisney> disneyList = new ArrayList<GameDisney>();
    private static ArrayList<GameVideoGames> videoGamesList = new ArrayList<GameVideoGames>();
    private static int gamesPlayed = 0;
    private static int activeGames = 0;

    public static void join(String username, String theme, WebSocket.In<JsonNode> in, WebSocket.Out<JsonNode> out) {
        GameWhoIsWho lastGame = getLastGame(theme);
        if (!lastGame.isPlayerOneDefined()) {
            final Player player = new Player(username, out, lastGame.getGameId());
            lastGame.setPlayerA(player);
            bingInWebSocket(in, player);
        } else if (!lastGame.isPlayerTwoDefined()) {
            final Player player = new Player(username, out, lastGame.getGameId());
            lastGame.setPlayerB(player);
            bingInWebSocket(in, player);
            lastGame.startGame();
        } else {
            createNewGame(theme);
            join(username, theme, in, out);
//            out.write(createServerFullMsg());
        }
    }

    private static GameWhoIsWho getLastGame(String theme) {
        GameWhoIsWho last;
        if (gameList.isEmpty()) {
            createNewGame(theme);
            last = gameList.get(0);
        } else {
            if(theme.contains("cel")){
                if(celebritiesList.isEmpty()){
                    createNewGame(theme);
                    last = celebritiesList.get(0);
                }else {
                    last= celebritiesList.get(celebritiesList.size() -1);
                }
            }else if(theme.contains("dis")){
                if(disneyList.isEmpty()){
                    createNewGame(theme);
                    last = disneyList.get(0);
                }else {
                    last= disneyList.get(disneyList.size() -1);
                }
            }
            else if(theme.contains("vid")){
                if(videoGamesList.isEmpty()){
                    createNewGame(theme);
                    last = videoGamesList.get(0);
                }else {
                    last= videoGamesList.get(videoGamesList.size() -1);
                }
            }
            else {
                if(classicList.isEmpty()){
                    createNewGame(theme);
                    last = classicList.get(0);
                }else {
                    last= classicList.get(classicList.size() -1);
                }
            }
        }
        return last;
    }




    private static void createNewGame(String theme) {
        activeGames++;
        gamesPlayed++;
        GameCelebrities celeb;
        GameDisney disne;
        GameVideoGames video;
        GameClassic classic;
        if(theme.contains("cel")){
            celeb= new GameCelebrities();
            celebritiesList.add(celeb);
            gameList.add(celeb);
        }
        else if(theme.contains("dis")){
            disne = new GameDisney();
            disneyList.add(disne);
            gameList.add(disne);
        }
        else if(theme.contains("vid")){
            video = new GameVideoGames();
            videoGamesList.add(video);
            gameList.add(video);
        }
        else{
            classic= new GameClassic();
            classicList.add(classic);
            gameList.add(classic);
        }
    }

    private static JsonNode createServerFullMsg() {
        final ObjectNode json = Json.newObject();
        json.put("error", "The server is full, try again later.");
        return json;
    }

    private static void bingInWebSocket(WebSocket.In<JsonNode> in, final Player player) {
        in.onMessage(new F.Callback<JsonNode>() {
            public void invoke(JsonNode jsonNode) throws Throwable {
                GameWhoIsWho game = getGameById(player.getGameId());
                String messageType = jsonNode.get("type").asText();
                System.out.println("Game: " + game.getGameId() + " - Event Received: Type = " + messageType);
                if (game.isStart()) {
                    if (messageType.equals("chat")) {
//                        Chat behavior
                        final String talk = jsonNode.get("text").asText();
                        game.chat(player, talk);
                    } else if (messageType.equals("question")) {
//                        Question behavior
                        final String questionString = jsonNode.get("questionString").asText();
                        final String questionAbout = jsonNode.get("questionAbout").asText();
                        final String questionValue = jsonNode.get("questionValue").asText();
                        game.ask(player, questionAbout, questionValue, questionString);
                    } else if (messageType.equals("answer")) {
//                        Answer behavior
                        final String answer = jsonNode.get("answer").asText();
                        game.answer(player, answer);
                    } else if (messageType.equals("guess")) {
//                        Guess behavior
                        final String guessCard = jsonNode.get("guessCard").asText();
                        game.guess(player, guessCard.toUpperCase());
                    }
                } else {
//                    Waiting for another player
                    game.waitForStart(player);
                }
                if (messageType.equals("serverInfo")) {
                    GameWhoIsWho.message(player, "info", "  " + activeGames + " Active Games" + " - " +
                            gamesPlayed + " Total Games Played");
                }
            }
        });

        in.onClose(new F.Callback0() {
            public void invoke() throws Throwable {
                GameWhoIsWho game = getGameById(player.getGameId());
                game.leave(player);
                if (game.isEmpty()) {
                    if(game instanceof GameCelebrities){
                        celebritiesList.remove(celebritiesList.indexOf((GameCelebrities) game));
                    }
                    if(game instanceof GameDisney){
                        disneyList.remove(disneyList.indexOf((GameDisney) game));
                    }
                    if(game instanceof GameVideoGames){
                        videoGamesList.remove(videoGamesList.indexOf((GameVideoGames) game));
                    }
                    if(game instanceof GameClassic){
                        classicList.remove(classicList.indexOf((GameClassic)game));
                    }
                    gameList.remove(gameList.indexOf(game));
                    activeGames--;
                }
            }
        });
    }

    private static GameWhoIsWho getGameById(String gameId) {
        for (GameWhoIsWho game : gameList) {
            if (game.getGameId().equals(gameId)) {
                return game;
            }
        }
        return null;
    }


}
