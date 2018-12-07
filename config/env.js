/*
 * LOG_LEVEL
 *
 * { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
 */


/*
 * LOG_FORMAT
 *
 * combined
 * Standard Apache combined log output.
 * :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"
 *
 * common
 * Standard Apache common log output.
 * :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]
 *
 * dev
 * Concise output colored by response status for development use. The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
 * :method :url :status :response-time ms - :res[content-length]
 *
 * short
 * Shorter than default, also including response time.
 * :remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms
 *
 * tiny
 * The minimal output.
 * :method :url :status :res[content-length] - :response-time ms
 */

/*
 * LOG_REQUEST_NEW_FILE_INTERVAL: '1d'
 *
 * ex: 5s, 10m, 1d
 */

/*
 * LOG_APPLICATION_FILE_MAXSIZE: '20m'
 *
 * maxSize: Maximum size of the file after which it will rotate. This can be a number of bytes, or units of kb, mb, and gb. If using the units, add 'k', 'm', or 'g' as the suffix. The units need to directly follow the number. (default: null)
 */

/*
 * LOG_APPLICATION_FILE_MAXFILES: '14d'
 *
 * maxFiles: Maximum number of logs to keep. If not set, no logs will be removed. This can be a number of files or number of days. If using days, add 'd' as the suffix. (default: null)
 */

const CONFIG = {
    DEV: {
        DB: {
            DB_NAME: 'wis_dev'
            ,DB_HOST: 'localhost'
            ,STARTUP_CLEAN_DB: 'true'
        }
        ,SERVER_PORT: 3000
        ,LOG_LEVEL: 'debug'
        ,LOG_FORMAT: 'common'
        ,LOG_REQUEST_NEW_FILE_INTERVAL: '1d'
        ,LOG_APPLICATION_FILE_MAXSIZE: '20m'
        ,LOG_APPLICATION_FILE_MAXFILES: '14d'
    }
    ,TEST: {
        DB: {
            DB_NAME: 'wis_test'
            ,DB_HOST: 'localhost'
            ,STARTUP_CLEAN_DB: 'true'
        }
        ,SERVER_PORT: 3000
        ,LOG_LEVEL: 'error'
        ,LOG_FORMAT: 'common'
        ,LOG_REQUEST_NEW_FILE_INTERVAL: '1d'
        ,LOG_APPLICATION_FILE_MAXSIZE: '20m'
        ,LOG_APPLICATION_FILE_MAXFILES: '14d'
    }
    ,HOMOLOGATION: {
        DB: {
            DB_NAME: 'wis_hom'
            ,DB_HOST: 'localhost'
            ,STARTUP_CLEAN_DB: 'false'
        }
        ,SERVER_PORT: 3000
        ,LOG_LEVEL: 'verbose'
        ,LOG_FORMAT: 'common'
        ,LOG_REQUEST_NEW_FILE_INTERVAL: '1d'
        ,LOG_APPLICATION_FILE_MAXSIZE: '20m'
        ,LOG_APPLICATION_FILE_MAXFILES: '14d'
    }
    ,PRODUCTION: {
        DB: {
            DB_NAME: 'wis_prod'
            ,DB_HOST: 'localhost'
            ,STARTUP_CLEAN_DB: 'false'
        }
        ,SERVER_PORT: 3000
        ,LOG_LEVEL: 'verbose'
        ,LOG_FORMAT: 'common'
        ,LOG_REQUEST_NEW_FILE_INTERVAL: '1d'
        ,LOG_APPLICATION_FILE_MAXSIZE: '20m'
        ,LOG_APPLICATION_FILE_MAXFILES: '14d'
    }
}

function getConfiguration() {
    if(!process.env.NODE_ENV || process.env.NODE_ENV == 'dev') {
        console.log('\n***** DEV CONFIGURATIONS *****\n');
        return CONFIG.DEV;    
    } else if(process.env.NODE_ENV == 'hom') {
        console.log('\n***** HOMOLOGATION CONFIGURATIONS *****\n');
        return CONFIG.HOMOLOGATION;
    } else if(process.env.NODE_ENV == 'prod') {
        console.log('\n***** PRODUCTION CONFIGURATIONS *****\n');
        return CONFIG.PRODUCTION;
    }
}

module.exports = getConfiguration();
