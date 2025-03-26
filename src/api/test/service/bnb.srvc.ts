import pool from "@config/db";
import { customLogger } from "@utils/lib/winston";
import { IRoom } from "@utils/type/room";

// 숙박업소 신규 등록
export const insertRoomService = async (body:any, files:any) => {
    const poolClient = await pool.connect();
    const roomInsertSql = `
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
        RETURNING id
        `;

    const fileInsertSql = `
        INSERT INTO mybnb.tb_files (
            room_id
            , file_origin_name
            , file_name
            , file_url
            , file_size
            , file_type
        )VALUES(
            $1
            , $2
            , $3
            , $4
            , $5
            , $6
        )
    `;

    try {
        await poolClient.query('BEGIN');

        // 1. 숙소 정보 등록
        const roomResult = await poolClient.query(roomInsertSql, [
            body.title
            , body.content
            , body.price
            , 1 // 임시로 1번 유저로 고정
            , body.lat
            , body.lon
            , body.address
            , body.detailAddress
        ]); 

        const roomId = roomResult.rows[0].id; // 방금 등록된 room_id

        // 2. 이미지 정보 등록
        if(files && files.length > 0){
            for(const file of files){
                await poolClient.query(fileInsertSql, [
                    roomId
                    , file.originalname
                    , file.filename
                    , file.path
                    , file.size
                    , file.mimetype
                ])
            }
        }

        customLogger.customedInfo('Insert Room Service');
        await poolClient.query('COMMIT');
        return roomId;
    } catch (error) {
        customLogger.customedError(`Insert Room Service Error`)
        await poolClient.query('ROLLBACK');
        throw error; // 에러를 던져서 상위에서 핸들링 가능하도록 설정
    }finally{
        poolClient.release();
    }
}

// 숙박업소 목록 조회
export const selectRoomsService = async (id?: string) => {
    const poolClient = await pool.connect();
    let sql = `
        select 
            id
            , title
            , content
            , price
            , reg_id
            , lat
            , lon
            , address
            , address_dtl
        from mybnb.tb_room
        `;

    let param : any[] = [];

    if(id){
        sql += 'where id = $1';
        param.push(id);
    }

    sql += 'order by id desc';

    try {
        await poolClient.query('BEGIN');

        // 1. 숙소 정보 등록
        const result = await poolClient.query(sql, param); 

        customLogger.customedInfo('Select Room Service');
        await poolClient.query('COMMIT');
        return result.rows as IRoom[];
    } catch (error) {
        customLogger.customedError(`Select Room Service Error`)
        await poolClient.query('ROLLBACK');
        throw error; // 에러를 던져서 상위에서 핸들링 가능하도록 설정
    }finally{
        poolClient.release();
    }
}