import pool from "@config/db";
import { customLogger } from "@utils/lib/winston";
import { IRoom } from "@utils/type/room";

// 숙박업소 신규 등록
export const insertRoomService = async (body:any, files:any, user:any) => {
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
            , service_fee
            , cleaning_fee
            , max_guests
            , amenities
        )VALUES(
            $1
            , $2
            , $3
            , $4
            , $5
            , $6
            , $7
            , $8
            , $9
            , $10
            , $11
            , $12
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

        // 파싱 처리
        const rawAmenities = body.amenities;
        let amenities = '';
        if(typeof rawAmenities === 'string'){
            try {
                const arr = JSON.parse(rawAmenities);
                if(Array.isArray(arr)){
                    amenities = arr.join(',');
                }
            } catch (error) {
                console.error(`Amenities 파싱 오류 : ${error}`);
                amenities = '';
            }
        }

        // 1. 숙소 정보 등록
        const roomResult = await poolClient.query(roomInsertSql, [
            body.title
            , body.content
            , body.price
            , user.id
            , body.lat
            , body.lon
            , body.address
            , body.address_dtl
            , body.service_fee
            , body.cleaning_fee
            , body.max_guests
            , amenities
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
export const selectRoomsService = async (user:any, page:number, limit:number, search:string) => {
    const poolClient = await pool.connect();
    // 숙박업소 목록 조회
    let sql = `
        with rt as (
            select 
                rt.room_id
                , round(avg(rt.rating), 1) as avg_rating
                , count(rt.room_id) as review_count
            from mybnb.tb_rating rt 
            group by rt.room_id
        )
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
            , r.service_fee
            , r.cleaning_fee
            , r.max_guests
            , r.amenities
            , case
                ${!user? ' when true then false ' : ''}            
                when f.room_id is not null then true 
                else false
                end as liked
            , rt.avg_rating
            , rt.review_count
        from mybnb.tb_room r
        left join mybnb.tb_favorite f on r.id = f.room_id `;

    if(user) sql += 'and f.user_id = $4 ';

	sql += `left join rt on rt.room_id = r.id
        where r.title like '%' || $3 || '%'
        order by r.id desc
        limit $1 offset $2`;

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

        const offset = (page - 1) * limit;
        let params = [limit, offset, search];
        if(user) params.push(user.id);
        const result = await poolClient.query(sql, params); 

        console.log(result.rows);

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
// 숙박업소 상세 조회
export const selectRoomDetailService = async (id: string) => {
    const poolClient = await pool.connect();
    // 숙박업소 목록 조회
    let sql = `
        select 
            r.id
            , r.title
            , r.content
            , r.price
            , r.reg_id
            , u.name as reg_name
            , u.email as reg_email
            , r.lat
            , r.lon
            , r.address
            , r.address_dtl
            , r.service_fee
            , r.cleaning_fee
            , r.max_guests
            , r.amenities
            , case
                when f.room_id is not null then true 
                else false
                end as liked
            , (select round(avg(rt.rating), 1) from mybnb.tb_rating rt where rt.room_id = r.id) as avg_rating
        from mybnb.tb_room r
        left join mybnb.tb_favorite f on r.id = f.room_id and r.reg_id = f.user_id
        left join mybnb.tb_user u on u.id = r.reg_id
        where r.id = $1
        order by r.id desc`;

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

    // 편의시설 공통코드 목록 조회
    let amenitiesSql = `
        select code_id
            , code_name
        from mybnb.tb_code
        where code_group_id = 'AMENITY'
        and use_yn = true
        and code_id = ANY($1)
        order by code_order
    `;

    try {
        await poolClient.query('BEGIN');

        const result = await poolClient.query(sql, [id]); 

        const enrichedRooms = await Promise.all(
            result.rows.map(async (room) => {
              const fileRslt = await poolClient.query(fileSql, [room.id]);
              const amenitiesArray = room.amenities ? room.amenities.split(',') : [];
              const amenitiesResult = await poolClient.query(amenitiesSql, [amenitiesArray]);
              return { ...room, images: fileRslt.rows || [], amenities: amenitiesResult.rows || [] };
            })
        );

        customLogger.customedInfo('Select Room Detail Service');
        await poolClient.query('COMMIT');
        return enrichedRooms as IRoom[];
    } catch (error) {
        customLogger.customedError(`Select Room Detail Service Error`)
        await poolClient.query('ROLLBACK');
        throw error; // 에러를 던져서 상위에서 핸들링 가능하도록 설정
    }finally{
        poolClient.release();
    }
}

// 좋아요 설정/해제 처리
export const toggleFavoriteRoomService = async (body:any, user:any) => {
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
            user.id
        ]);

        let result;
        if (Number(existsResult.rowCount) > 0) {
            result = await poolClient.query(DELETE_SQL, [
              body.roomId,
              user.id
            ]);
            customLogger.customedInfo('toggleFavoriteRoomService - 찜 삭제 (UNFAVORITE)');
        } else {
            result = await poolClient.query(INSERT_SQL, [
              body.roomId,
              user.id
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

// 공통코드 목록 조회
export const selectCodesService = async (code_group_id:string, code_id?:string) => {
    const poolClient = await pool.connect();
    let sql = `
        select code_id
            , code_name
        from mybnb.tb_code
        where code_group_id = $1
        ${code_id ? ' and code_id = $2 ' : ''}
        and use_yn = true
        order by code_order
        `;

    try {
        await poolClient.query('BEGIN');

        let params = [code_group_id];
        if(code_id) params.push(code_id)
        const result = await poolClient.query(sql, params); 

        customLogger.customedInfo('Select Codes Service');

        await poolClient.query('COMMIT');
        return result.rows;
    } catch (error) {
        customLogger.customedError(`Select Codes Service Error`)
        await poolClient.query('ROLLBACK');
        throw error; // 에러를 던져서 상위에서 핸들링 가능하도록 설정
    }finally{
        poolClient.release();
    }
};

// 후기 등록
export const insertReviewService = async (body:any, user:any) => {
    const poolClient = await pool.connect();
    const sql = `
        INSERT INTO mybnb.tb_rating (
            room_id
            , reg_id
            , rating
            , comment
        )VALUES(
            $1
            , $2
            , $3
            , $4
        )
        `;

    try {
        await poolClient.query('BEGIN');

        const result = await poolClient.query(sql, [
            body.room_id
            , user.id
            , body.rating
            , body.comment
        ]); 

        customLogger.customedInfo('Insert Review Service');
        await poolClient.query('COMMIT');
        return result.rowCount;
    } catch (error) {
        customLogger.customedError(`Insert Review Service Error`)
        await poolClient.query('ROLLBACK');
        throw error; // 에러를 던져서 상위에서 핸들링 가능하도록 설정
    }finally{
        poolClient.release();
    }
}

// 후기 목록 조회
export const selectReviewsService = async (room_id:string) => {
    const poolClient = await pool.connect();
    let sql = `
        select r.id
            , r.room_id
            , r.reg_id
            , u.name as reg_name
            , r.rating
            , r.comment
            , to_char(r.updated_at, 'YYYY-MM-DD') as updated_at 
        from mybnb.tb_rating r
        left join mybnb.tb_user u on u.id = r.reg_id
        where r.room_id = $1
        order by id desc
        `;

    try {
        await poolClient.query('BEGIN');

        const result = await poolClient.query(sql, [room_id]); 

        customLogger.customedInfo('Select Reviews Service');

        await poolClient.query('COMMIT');
        return result.rows;
    } catch (error) {
        customLogger.customedError(`Select Reviews Service Error`)
        await poolClient.query('ROLLBACK');
        throw error; // 에러를 던져서 상위에서 핸들링 가능하도록 설정
    }finally{
        poolClient.release();
    }
}

// 예약 등록
export const insertBookingService = async (body:any, user:any) => {
    const poolClient = await pool.connect();

    const roomResult = await selectRoomDetailService(body.room_id);
    if (!roomResult || roomResult.length === 0) {
        throw new Error('숙소 정보를 찾을 수 없습니다.');
    }

    const room = roomResult[0];

    // 스냅샷 만들기
    const snapshot = {
        id: room.id,
        title: room.title,
        content: room.content,
        price: room.price,
        reg_id: room.reg_id,
        reg_name: room.reg_name,
        reg_email: room.reg_email,
        lat: room.lat,
        lon: room.lon,
        address: room.address,
        address_dtl: room.address_dtl,
        service_fee: room.service_fee,
        cleaning_fee: room.cleaning_fee,
        max_guests: room.max_guests,
        amenities: room.amenities, 
        images: room.images,
        created_at: room.created_at,
        updated_at: room.updated_at
    };

    // 예약 등록
    let inserSql = `
        INSERT INTO mybnb.tb_booking (
            room_id
            , reg_id
            , checkin_dt
            , checkout_dt
            , guest_count
            , total_price
            , room_snapshot
        )VALUES(
            $1
            , $2
            , $3
            , $4
            , $5
            , $6
            , $7
        )
        RETURNING id
        `;

    try {
        await poolClient.query('BEGIN');

        const result = await poolClient.query(inserSql, [
            body.room_id
            , user.id
            , body.checkin_dt
            , body.checkout_dt
            , body.guest_count
            , body.total_price
            , snapshot]); 

        customLogger.customedInfo('Insert Booking Service');

        await poolClient.query('COMMIT');
        return result.rows[0].id;
    } catch (error) {
        customLogger.customedError(`Insert Booking Service Error`)
        await poolClient.query('ROLLBACK');
        throw error; // 에러를 던져서 상위에서 핸들링 가능하도록 설정
    }finally{
        poolClient.release();
    }
}

// 예약 상세 조회
export const selectBookingDetailService = async (booking_id:string) => {
    const poolClient = await pool.connect();
    let sql = `
        select b.id
            , b.room_id
            , b.reg_id
            , u.name as reg_name
            , u.email as reg_email
            , b.checkin_dt
            , b.checkout_dt
            , b.guest_count
            , b.total_price
            , b.room_snapshot
            , b.status
            , c.code_name as status_name
            , to_char(b.created_at, 'YYYY-MM-DD') as created_at 
        from mybnb.tb_booking b
        left join mybnb.tb_user u on u.id = b.reg_id
        left join mybnb.tb_code c on c.code_id = b.status and c.code_group_id = 'BOOKING_STATUS'
        where b.id = $1
        `;

    try {
        await poolClient.query('BEGIN');

        const result = await poolClient.query(sql, [booking_id]); 

        customLogger.customedInfo('Select Booking Detail Service');

        await poolClient.query('COMMIT');
        return result.rows[0];
    } catch (error) {
        customLogger.customedError(`Select Booking Detail Service Error`)
        await poolClient.query('ROLLBACK');
        throw error; // 에러를 던져서 상위에서 핸들링 가능하도록 설정
    }finally{
        poolClient.release();
    }
}

// 예약 상태 변경
export const updateBookingStatusService = async (booking_id:string, status:string) => {
    const poolClient = await pool.connect();
    let sql = `
        UPDATE mybnb.tb_booking
        SET status = $1
        WHERE id = $2
        `;

    try {
        await poolClient.query('BEGIN');

        const result = await poolClient.query(sql, [status, booking_id]); 

        customLogger.customedInfo('Update Booking Status Service');

        await poolClient.query('COMMIT');
        return result.rowCount;
    } catch (error) {
        customLogger.customedError(`Update Booking Status Service Error`)
        await poolClient.query('ROLLBACK');
        throw error; // 에러를 던져서 상위에서 핸들링 가능하도록 설정
    }finally{
        poolClient.release();
    }
}

// 예약 목록 조회
export const selectBookingsService = async (user:any, page:number, limit:number, search:string, status:string, sort:string) => {
    const poolClient = await pool.connect();
    let sql = `
        select b.id
            , b.room_id
            , b.reg_id
            , u.name as reg_name
            , u.email as reg_email
            , b.checkin_dt
            , b.checkout_dt
            , b.guest_count
            , b.total_price
            , b.room_snapshot
            , b.status
            , c.code_name as status_name
            , to_char(b.created_at, 'YYYY-MM-DD') as created_at 
        from mybnb.tb_booking b
        left join mybnb.tb_user u on u.id = b.reg_id
        left join mybnb.tb_code c on c.code_id = b.status and c.code_group_id = 'BOOKING_STATUS'
        where 
            b.reg_id = $1
            and b.room_snapshot->>'title' like '%' || $2 || '%'`;
    if (status === 'upcoming') {
        sql += `and b.status = 'confirmed'`;
    }else if (status === 'completed') {
        sql += `and b.status != 'confirmed'`;
    }
    sql += `order by b.id ${sort}
        limit $3 offset $4
    `;

    try {
        await poolClient.query('BEGIN');

        const offset = (page - 1) * limit;
        const result = await poolClient.query(sql, [user.id, search, limit, offset]); 

        customLogger.customedInfo('Select Bookings Service');

        await poolClient.query('COMMIT');
        return result.rows;
    } catch (error) {
        customLogger.customedError(`Select Bookings Service Error`)
        await poolClient.query('ROLLBACK');
        throw error; // 에러를 던져서 상위에서 핸들링 가능하도록 설정
    }finally{
        poolClient.release();
    }
}

// 이메일 중복 체크
export const checkEmailService = async (email:string) => {
    const poolClient = await pool.connect();
    let sql = `
        select count(*) as count
        from mybnb.tb_user
        where email = $1
        `;

    try {
        await poolClient.query('BEGIN');

        const result = await poolClient.query(sql, [email]); 

        customLogger.customedInfo(`Check Email Service : ${email}`);

        await poolClient.query('COMMIT');
        return result.rows[0].count > 0;
    } catch (error) {
        customLogger.customedError(`Check Email Service Error : ${error}`);
        await poolClient.query('ROLLBACK');
        throw error; // 에러를 던져서 상위에서 핸들링 가능하도록 설정
    }finally{
        poolClient.release();
    }
        
}

// 회원정보 조회
export const getUserByEmail = async (email: string) => {
    const poolClient = await pool.connect();
    let sql = `
        select *
        from mybnb.tb_user
        where email = $1
        `;

    try {
        await poolClient.query('BEGIN');

        const result = await poolClient.query(sql, [email]); 

        customLogger.customedInfo(`Check Email Service : ${email}`);

        await poolClient.query('COMMIT');
        return result.rows[0];
    } catch (error) {
        customLogger.customedError(`Check Email Service Error : ${error}`);
        await poolClient.query('ROLLBACK');
        throw error; // 에러를 던져서 상위에서 핸들링 가능하도록 설정
    }finally{
        poolClient.release();
    }
}

// 회원가입
export const signupService = async (body:any) => {
    const { name, email, password } = body;
    const poolClient = await pool.connect();
    let sql = `
        insert into mybnb.tb_user (
            name, email, password, role
        ) values (
            $1, $2, $3, 'ROLE_GUEST'
        )`;

    try {
        await poolClient.query('BEGIN');

        const result = await poolClient.query(sql, [name, email, password]); 

        customLogger.customedInfo(`Signup Service : ${email}`);

        await poolClient.query('COMMIT');
        return result.rowCount;
    } catch (error) {
        customLogger.customedError(`Signup Service Error : ${error}`);
        await poolClient.query('ROLLBACK');
        throw error; // 에러를 던져서 상위에서 핸들링 가능하도록 설정
    }finally{
        poolClient.release();
    }
}