import pool from "@config/db";
import { customLogger } from "@utils/lib/winston";



export const testService = async (name :string) => {
    const poolClient = await pool.connect();
    let sql = `
        SELECT id "id"
        , user_id "userId"
        , "name"
        , created_at "createAt"
        FROM tb_test
        WHERE name = $1
        `
    try {
        await poolClient.query('BEGIN');;
        const result = await poolClient.query(sql, [name]); 
        customLogger.customedInfo('test');
        await poolClient.query('COMMIT');
        return result.rows
    } catch (error) {
        customLogger.customedError(`testService Error`)
        await poolClient.query('ROLLBACK');
    }finally{
        poolClient.release();
    }
}

export const testPostService = async (id:number, name :string) => {
    const poolClient = await pool.connect();
    let sql = `
        INSERT INTO tb_test (
            user_id
            , name
        )VALUES(
            $1
            , $2
        )
        `
        
    try {
        await poolClient.query('BEGIN');;
        const result = await poolClient.query(sql, [id,name]); 
        customLogger.customedInfo('test');
        await poolClient.query('COMMIT');
        return result.rows
    } catch (error) {
        customLogger.customedError(`testService Error`)
        await poolClient.query('ROLLBACK');
    }finally{
        poolClient.release();
    }
}

