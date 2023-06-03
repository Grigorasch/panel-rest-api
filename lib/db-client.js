const { MongoClient } = require('mongodb');

/**
 * Класс для работы с базой данных
 */
class DBClient {
    /**
    * @typedef {Object} DB_STATUS - объект с константами статусов клиента
    * @property {number} NOT_EXIST - База данных не существует
    * @property {number} READY_TO_USE - База данных готова к использованию
    * @property {number} CONNECT - Установлено соединение с базой данных
    * @property {number} BUSY - База данных занята
    * @property {number} DISCONNECT - Соединение с базой данных разорвано
    * @property {number} ERROR - Ошибка при работе с базой данных
    * @private
    */
    #DB_STATUS = {
        NOT_EXIST: 0,
        READY: 1,
        BUSY: 2,
        DISCONNECT: -1,
    };
    /**
    * @type {string} defaultUrl - адрес базы данных по умолчанию
    * @private
    */
    #defaultUrl = 'mongodb://95.163.242.6:27017';
    /**
    * @type {number} status - текущий статус клиента
    * @private
    */
    #status = this.#DB_STATUS.NOT_EXIST;
    /**
    * @type {MongoClient} client - клиент для работы с базой данных
    * @private
    */
    #client;
    /**
     * Объект содержащий коллекции из базы
     * @type {{}}
     */
    #collection={}
    /**
    * @type {string} url - адрес текущей базы данных
    * @private
    */
    #currentUrl;

    /**
    * @param {string} [dbUrl] - адрес базы данных. Если не указан, то выполняет подключение к 
    */
    constructor(dbUrl = this.#defaultUrl) {
        this.#currentUrl = dbUrl;
        this.#dbConnect(this.#currentUrl, this.getStatus())
            .then((data) => {
                console.log('Connection of DB successful');
                this.#client = data;
                console.log(this.#client);
                this.#status = this.#DB_STATUS.READY;
            })
            .catch(console.error);
    }

    /**
    * Возвращает текущий статус базы данных.
    * @returns {any} Значение поля #status.
    */
    getStatus() {
        return this.#status;
    }

    /**
     * Создаёт экземпляр MongoClient и устанавливает соединение с базой данных.
     * @param {string} url - адрес базы данных
     * @param {number} status - status - текущий статус базы данных
     * @returns {Promise<MongoClient>} Клиент для работы с базой данных.
     * @throws {TypeError} Если сущность не готова, невозможно произвести подключение. Текущий код состояния: ${status}
     */
    async #dbConnect(url, status) {
        if (
            status !== this.#DB_STATUS.NOT_EXIST
            && status !== this.#DB_STATUS.READY
            && status !== this.#DB_STATUS.DISCONNECT
        ) {
            throw new TypeError(`Сущьность не готова, невозможно произвести подключение. Текущий код состояния: ${status}`)
        }
        const mClient = new MongoClient(url);
        await mClient.connect();
        return mClient;
    }

    /**
    * Возвращает объект, содержащий значения приватных полей.
    * @returns {Object} Объект содержащий значения приватных полей.
    */
    #getGlobalField() {
        return {
            status: this.#status,
            client: this.#client
        };
    }
}