import winston, { Logger, createLogger, transports, format, config } from 'winston';
import winstonDaily from 'winston-daily-rotate-file';
import appRoot from 'app-root-path';

const LOG_DIR = `${appRoot}/logs`;

interface CustomTransformableInfo extends winston.Logform.TransformableInfo {
    timestamp?: string;
    label?: string;
}

// 직접 정의한 로그 레벨
const customLevels: config.AbstractConfigSetLevels = {
  customedError: 0,
  customedWarn: 1,
  customedInfo: 2,
  customedDebug: 3,
  customedSilly: 4
}

// 레벨별 색상
const customColors: config.AbstractConfigSetColors = {
  customedError: 'red',
  customedWarn: 'yellow',
  customedInfo: 'cyan',
  customedDebug: 'magenta',
  customedSilly: 'gray'
}

// 색상을 추가하고 싶다면 winston에게 이를 알려야 한다.
winston.addColors(customColors);

interface CustomLevels extends winston.Logger {
  customedError: winston.LeveledLogMethod;
  customedWarn: winston.LeveledLogMethod;
  customedInfo: winston.LeveledLogMethod;
  customedDebug: winston.LeveledLogMethod;
  customedSilly: winston.LeveledLogMethod;
}

export const customLogger: CustomLevels = <CustomLevels>createLogger({
  levels: customLevels,
  format: format.combine(
    format.label({ label: '[customed-server]' }),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.colorize(),
    format.printf((info: CustomTransformableInfo) => {
        return `${info.timestamp} - ${info.level}: ${info.label} ${info.message}`;
    })
  ),
  transports: [
    new transports.Console({ level: 'customedSilly' }),
    new winstonDaily({
        level: 'customedError',
        datePattern: 'YYYY-MM-DD',
        dirname: LOG_DIR,
        filename: '%DATE%-ERROR.log',
        maxFiles: '30d',
        maxSize: '20m',
    }),
    new winstonDaily({
        level: 'customedDebug',
        datePattern: 'YYYY-MM-DD',
        dirname: LOG_DIR,
        filename: '%DATE%-DEBUG.log',
        maxFiles: '30d',
        maxSize: '20m',
    }),
  ]
});
