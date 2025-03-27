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
            , body.address_dtl
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
    // 숙박업소 목록 조회
    let sql = `
        select 
            r.id
            , r.title
            , r.content
            , r.price
            , r.reg_id
            , r.lat
            , r.lon
            , r.address
            , r.address_dtl
            , case
                when f.room_id is not null then true 
                else false
                end as liked
        from mybnb.tb_room r
        left join mybnb.tb_favorite f on r.id = f.room_id and r.reg_id = f.user_id
        `;

    let param : any[] = [];

    if(id){
        sql += 'where r.id = $1';
        param.push(id);
    }

    sql += 'order by r.id desc';

    // 파일 목록 조회
    let fileSql = `
        select f.id file_id
            , f.room_id 
            , f.file_name 
            , f.file_url 
            , f.file_origin_name 
            , f.file_size 
            , f.file_type 
        from mybnb.tb_files f
        where f.room_id = $1
        order by f.id
    `;

    try {
        await poolClient.query('BEGIN');

        const result = await poolClient.query(sql, param); 

        const enrichedRooms = await Promise.all(
            result.rows.map(async (room) => {
              const fileRslt = await poolClient.query(fileSql, [room.id]);
              return { ...room, images: fileRslt.rows || [] };
            })
        );

        customLogger.customedInfo('Select Room Service');
        await poolClient.query('COMMIT');
        return enrichedRooms as IRoom[];
    } catch (error) {
        customLogger.customedError(`Select Room Service Error`)
        await poolClient.query('ROLLBACK');
        throw error; // 에러를 던져서 상위에서 핸들링 가능하도록 설정
    }finally{
        poolClient.release();
    }
}

// 좋아요 설정/해제 처리
export const toggleFavoriteRoomService = async (body:any) => {
    const poolClient = await pool.connect();

    const SELECT_SQL = `
        SELECT 1 FROM mybnb.tb_favorite 
        WHERE room_id = $1 AND user_id = $2
    `;

    const DELETE_SQL = `
        DELETE FROM mybnb.tb_favorite 
        WHERE room_id = $1 AND user_id = $2
    `;

    const INSERT_SQL = `
        INSERT INTO mybnb.tb_favorite (room_id, user_id)
        VALUES ($1, $2)
    `;

    try {
        await poolClient.query('BEGIN');

        const existsResult = await poolClient.query(SELECT_SQL, [
            body.roomId,
            1, // 실제 유저 ID로 교체
        ]);

        let result;
        if (Number(existsResult.rowCount) > 0) {
            result = await poolClient.query(DELETE_SQL, [
              body.roomId,
              1,
            ]);
            customLogger.customedInfo('toggleFavoriteRoomService - 찜 삭제 (UNFAVORITE)');
        } else {
            result = await poolClient.query(INSERT_SQL, [
              body.roomId,
              1,
            ]);
            customLogger.customedInfo('toggleFavoriteRoomService - 찜 등록 (FAVORITE)');
        }

        await poolClient.query('COMMIT');
        return result.rowCount;
    } catch (error) {
        customLogger.customedError(`Insert Room Service Error`)
        await poolClient.query('ROLLBACK');
        throw error; // 에러를 던져서 상위에서 핸들링 가능하도록 설정
    }finally{
        poolClient.release();
    }
}