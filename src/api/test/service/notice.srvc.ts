import pool from "@config/db";
import { customLogger } from "@utils/lib/winston";
import { TNoticeData } from "@utils/type/notice";

export const selectNoticeService = async () => {
    const poolClient = await pool.connect();
    let sql = `
        SELECT 
            id
            , title
            , writer
            , date
        FROM tb_notice
        `
    try {
        await poolClient.query('BEGIN');
        const result = await poolClient.query(sql); 
        customLogger.customedInfo('Select Notice Service');
        await poolClient.query('COMMIT');
        return result.rows
    } catch (error) {
        customLogger.customedError(`Select Notice Service Error`)
        await poolClient.query('ROLLBACK');
    }finally{
        poolClient.release();
    }
}

export const insertNoticeService = async (param:TNoticeData) => {
    const poolClient = await pool.connect();
    let sql = `
        INSERT INTO tb_notice (
            title
            , writer
            , date
        )VALUES(
            $1
            , $2
            , $3
        )
        `
        
    try {
        await poolClient.query('BEGIN');;
        const result = await poolClient.query(sql, [param.title, param.writer, param.date]); 
        customLogger.customedInfo('Insert Notice Service');
        await poolClient.query('COMMIT');
        return result.rows
    } catch (error) {
        customLogger.customedError(`Insert Notice Service Error`)
        await poolClient.query('ROLLBACK');
    }finally{
        poolClient.release();
    }
}

