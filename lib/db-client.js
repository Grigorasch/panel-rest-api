import { MongoClient } from "mongodb";

/**
 * Класс для работы с базой данных
 */
class DBClient {
    /**
     * Объект с константами статусов клиента
     * @alias DB_STATUS
     * @memberof! DBClient#
     * @private
     * @const {Object<number>}
     * @property {number} NOT_EXIST=0 - База данных не существует
     * @property {number} READY=1 - База данных готова к использованию
     * @property {number} BUSY=2 - База данных занята
     * @property {number} DISCONNECT=-1 - Соединение с базой данных разорвано
     * @property {number} ERROR=-2 - Клиент в состоянии ошибки
     */
    #DB_STATUS = {
        NOT_EXIST: 0,
        READY: 1,
        BUSY: 2,
        DISCONNECT: -1,
        ERROR: -2,
    };
    /**
     * Экземпляр клиента для работы с базой данных
     * @const {MongoClient} 
     * @private
     */
    #client;
    /**
     * Объект содержащий коллекции из базы. Используется для более простого обращения к колекциям
     * @alias coll
     * @memberof! DBClient#
     * @const {Object.<Db>}
     * @private
     */
    #coll;
    /**
     * Объект хранит функции, которые возвращают свою глобальную переменную
     * @private
     * @alias globalStateFunctions
     * @memberof! DBClient# 
     * @const {DBClientGlobalVar}
     */
    #globalStateFunctions = {
        status: () => this.#status,
    }
    /**
     * 
     */
    #db;
    /**
     * Текущий статус клиента. Допустимые значения соответсвуют [константам]{@link DBClient#DB_STATUS}
     * @alias status
     * @memberof! DBClient# 
     * @type {number}
     * @private
     */
    #status = this.#DB_STATUS.NOT_EXIST;
    /**
     * URL базы данных
     * @const {string}
     * @default mongodb://95.163.242.6:27017
     * @private
     */
    #url = 'mongodb://95.163.242.6:27017';


    /**
    * Создаётся экземпляр клиента <MongoClient> и подключает его к базе.
    * В случае успешного подключения [Статус клиента]{@link DBClient#status} устанавливается [READY]{@link DBClient#DB_STATUS}.
    * В случае ошибки [Статус клиента]{@link DBClient#status} устанавливается [ERROR]{@link DBClient#DB_STATUS}.
    */
    constructor() {
        console.log('DB connecting');
        this.#status = this.#DB_STATUS.BUSY;
        //Подключение к БД
        this.#dbConnect(this.#url, this.getStatus())
            .then((data) => {
                console.log('Connection of DB successful');
                // Возвращаем экземпляр клиента
                this.#client = data;
                // Получаем экземпляр БД
                this.#getDB(this.#client)
                    .then((dbData) => {
                        this.#db = dbData;
                        console.log('DB received');
                        // Получаем экземпляр коллекций
                        this.#getColl(this.#db)
                            .then((collData) => {
                                this.#coll = collData;
                                console.log('Collections received');
                                this.#status = this.#DB_STATUS.READY;
                            });
                    })
            })
            .catch((error) => {
                console.error(error);
                this.#status = this.#DB_STATUS.ERROR;
            });
    }

    close() {
        this.#status = this.#DB_STATUS.BUSY;
        this.#clientClose(this.#client)
            .then(() => {
                console.log('Connection close');
                this.#status = this.#DB_STATUS.DISCONNECT;
            })
            .catch((error) => {
                console.error(error);
                this.#status = this.#DB_STATUS.ERROR;
            });
    }

    /**
     * Description placeholder
     *
     * @async
     * @param {*} client
     * @returns {*}
     */
    async #clientClose(client) {
        await client.close();
    }


    async #getDB(client) {
        return await client.db('admin_panel');
    }
    async #getColl(db) {
        const coll = {};
        coll.users = await db.collection('users');
        return coll;
    }



    /**
    * Возвращает текущий статус клиента.
    * @returns {number} Текущий статус клиента.
    */
    getStatus() {
        return this.#status;
    }








    DBClientPrivat() { }
    /**
     * @classdesc Приватные функции класса {@link DBClient}
     * @name DBClientPrivat
     * @class
     */

    /**
     * Приватный метод. Создаёт экземпляр MongoClient и устанавливает соединение с базой данных.
     * @alias _dbConnect
     * @memberof! DBClientPrivat#
     * @param {string} url - Адрес базы данных
     * @param {DBClientGlobalVar} status - [Статус клиента]{@link DBClient#status}
     * @returns {Promise.<MongoClient>} Клиент для работы с базой данных.
     */
    async #dbConnect(url, status) {
        const client = new MongoClient(url);
        await client.connect();
        return client;
    }

    /**
     * Возвращает объект, содержащий значения требуемых глобальных переменных
     * @alias _getGlobalState
     * @memberof! DBClientPrivat#
     * @param {string[]} [stateArr=All] - Массив с перечнем глобальных переменных, значения которых будут возвращены в результате выполнения функции. Если не указан, то будут возвращены все доступные глобальные переменные.
     * @param {Object} [stateFunctions=(Объект глобальных функций)] - [Объект глобальных функций]{@link DBClient#globalStateFunctions}
     * @returns {Object.<DBClientGlobalVar>}
     */
    #getGlobalState(
        stateArr,
        stateFunctions = this.#globalStateFunctions
    ) {
        // Объект хранящий функции, каждая из которых возвращает одну глобальную переменную
        if (stateArr) {
            return this.#getObjectFields(stateArr, stateFunctions);
        }
        return this.#getObjectFields(
            Object.keys(stateFunctions),
            stateFunctions
        );
    }









    DBClientFunc() { }
    /**
     * Вспомогательные функции класса {@link DBClient}
     * @name DBClientFunc
     * @class
     */

    /**
     * Функция создает новый объект, содержащий только те свойства из объекта fields, для которых есть соответствующие функции в объекте functions, и значения этих свойств получаются вызовом соответствующих функций
     * @alias getObjectFields
     * @memberof! DBClientFunc#
     * @param {string[]} fields
     * @param {Object.<Function>} functions
     * @returns {Object}
     */
    #getObjectFields(fields, functions) {
        let result = {};
        for (let index in fields) {
            const key = fields[index];
            try {
                result[key] = functions[key]();
            } catch (error) {
                console.error(error);
            }
        }
        return result;
    }
}

export default DBClient;

/**
 * Глобальные переменные используемые в объектах {@link DBClient}
 * @typedef {_GlobalVar} DBClientGlobalVar
 * @property {} status Текущее состояние клиента для работы с базой данных. Возможно получить при помощи метода [getStatus]{@link DBClient#getStatus}
 */