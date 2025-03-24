import pool from "@config/db";
import { customLogger } from "@utils/lib/winston";
import { IRoom } from "@utils/type/room";

// 숙박업소 신규 등록
export const insertRoomService = async (param:IRoom) => {
    const poolClient = await pool.connect();
    let sql = `
        INSERT INTO mybnb.tb_room (
            title
            , content
            , price
            , reg_id
            , lat
            , lon
            , address
            , address_dtl
        )VALUES(
            $1
            , $2
            , $3
            , $4
            , $5
            , $6
            , $7
            , $8
        )
        `
    try {
        await poolClient.query('BEGIN');
        const result = await poolClient.query(sql, [
            param.title
            , param.content
            , param.price
            , 1 // 임시로 1번 유저로 고정
            , param.lat
            , param.lon
            , param.address
            , param.detailAddress
        ]); 
        customLogger.customedInfo('Insert Room Service');
        await poolClient.query('COMMIT');
        return result.rowCount
    } catch (error) {
        customLogger.customedError(`Insert Room Service Error`)
        await poolClient.query('ROLLBACK');
        throw error; // 에러를 던져서 상위에서 핸들링 가능하도록 설정
    }finally{
        poolClient.release();
    }
}
