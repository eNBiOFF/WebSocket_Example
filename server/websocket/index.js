const WebSocket = require('ws')
const queryString = require('query-string')

async function websocket(expressServer) {
    //создаем сервер websocket
    const websocketServer = new WebSocket.Server({
        noServer: true,
        path: "/websockets",
    });

    // ловим обновление http сервера
    expressServer.on("upgrade", (request, socket, head) => {
        websocketServer.handleUpgrade(request, socket, head, (websocket) => {
            //вызываем подключение
            websocketServer.emit("connection", websocket, request);
        });
    });

    // создаем подключение по websocket
    websocketServer.on(
        "connection",
        function connection(websocketConnection, connectionRequest) {
            // получаем параметры запроса
            const [_path, params] = connectionRequest?.url?.split("?");
            const connectionParams = queryString.parse(params);

            /** получить параметры запроса бывает важно, например, когда вы хотите сделать запрос авторизованным */
            console.log(connectionParams);

            //после подключения отправляем юзеру приветсвенное сообщение
            websocketConnection.send(JSON.stringify({message: 'hello, my friend, how are you?'}))

            //обработчик полученных сообщений, обратите внимание, что тело запроса приходит в json, поэтому его нужно предварительно распарсить
            websocketConnection.on("message", (message) => {
                const parsedMessage = JSON.parse(message);
                websocketConnection.send(JSON.stringify({ message: parsedMessage.message + '🤗' }));
            });
        }
    );

    return websocketServer;
};

module.exports = websocket