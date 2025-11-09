'''
Business: Admin API for managing phone database and users
Args: event - dict with httpMethod, body, queryStringParameters
      context - object with request_id, function_name attributes
Returns: HTTP response dict with statusCode, headers, body
'''

import json
import os
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url)

def cors_headers() -> Dict[str, str]:
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
        'Access-Control-Max-Age': '86400'
    }

def get_phone_records(search: str = '') -> List[Dict[str, Any]]:
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if search:
                cur.execute(
                    """
                    SELECT id, phone, name, info, status, 
                           TO_CHAR(created_at, 'DD.MM.YYYY') as created_at
                    FROM phone_records 
                    WHERE phone LIKE %s OR name ILIKE %s
                    ORDER BY id DESC
                    """,
                    (f'%{search}%', f'%{search}%')
                )
            else:
                cur.execute(
                    """
                    SELECT id, phone, name, info, status,
                           TO_CHAR(created_at, 'DD.MM.YYYY') as created_at
                    FROM phone_records 
                    ORDER BY id DESC
                    """
                )
            results = cur.fetchall()
            return [dict(row) for row in results]
    finally:
        conn.close()

def get_bot_users(search: str = '') -> List[Dict[str, Any]]:
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if search:
                cur.execute(
                    """
                    SELECT id, telegram_id, username, first_name, last_name, 
                           search_count, status,
                           TO_CHAR(created_at, 'DD.MM.YYYY') as joined,
                           TO_CHAR(last_active, 'DD.MM.YYYY HH24:MI') as last_active
                    FROM bot_users 
                    WHERE username ILIKE %s OR first_name ILIKE %s OR last_name ILIKE %s
                    ORDER BY last_active DESC
                    """,
                    (f'%{search}%', f'%{search}%', f'%{search}%')
                )
            else:
                cur.execute(
                    """
                    SELECT id, telegram_id, username, first_name, last_name, 
                           search_count, status,
                           TO_CHAR(created_at, 'DD.MM.YYYY') as joined,
                           TO_CHAR(last_active, 'DD.MM.YYYY HH24:MI') as last_active
                    FROM bot_users 
                    ORDER BY last_active DESC
                    """
                )
            results = cur.fetchall()
            return [dict(row) for row in results]
    finally:
        conn.close()

def get_statistics() -> Dict[str, Any]:
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT COUNT(*) as total FROM bot_users")
            total_users = cur.fetchone()['total']
            
            cur.execute("SELECT COUNT(*) as total FROM search_history")
            total_searches = cur.fetchone()['total']
            
            cur.execute("SELECT COUNT(*) as total FROM phone_records WHERE status = 'active'")
            database_records = cur.fetchone()['total']
            
            cur.execute(
                "SELECT COUNT(*) as total FROM bot_users WHERE last_active >= CURRENT_DATE"
            )
            active_today = cur.fetchone()['total']
            
            return {
                'totalUsers': total_users,
                'totalSearches': total_searches,
                'databaseRecords': database_records,
                'activeToday': active_today
            }
    finally:
        conn.close()

def add_phone_record(phone: str, name: str, info: str) -> Dict[str, Any]:
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                INSERT INTO phone_records (phone, name, info, status)
                VALUES (%s, %s, %s, 'active')
                RETURNING id, phone, name, info, status
                """,
                (phone, name, info)
            )
            result = cur.fetchone()
            conn.commit()
            return dict(result)
    finally:
        conn.close()

def update_phone_record(record_id: int, phone: str, name: str, info: str, status: str) -> Dict[str, Any]:
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                UPDATE phone_records 
                SET phone = %s, name = %s, info = %s, status = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id, phone, name, info, status
                """,
                (phone, name, info, status, record_id)
            )
            result = cur.fetchone()
            conn.commit()
            return dict(result) if result else None
    finally:
        conn.close()

def update_user_status(user_id: int, status: str) -> Dict[str, Any]:
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                UPDATE bot_users 
                SET status = %s
                WHERE id = %s
                RETURNING id, telegram_id, username, status
                """,
                (status, user_id)
            )
            result = cur.fetchone()
            conn.commit()
            return dict(result) if result else None
    finally:
        conn.close()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers(),
            'body': ''
        }
    
    try:
        path = event.get('queryStringParameters', {}).get('path', '')
        search = event.get('queryStringParameters', {}).get('search', '')
        
        if method == 'GET':
            if path == 'statistics':
                stats = get_statistics()
                return {
                    'statusCode': 200,
                    'headers': cors_headers(),
                    'body': json.dumps(stats)
                }
            
            elif path == 'phone-records':
                records = get_phone_records(search)
                return {
                    'statusCode': 200,
                    'headers': cors_headers(),
                    'body': json.dumps(records)
                }
            
            elif path == 'users':
                users = get_bot_users(search)
                return {
                    'statusCode': 200,
                    'headers': cors_headers(),
                    'body': json.dumps(users)
                }
            
            else:
                return {
                    'statusCode': 400,
                    'headers': cors_headers(),
                    'body': json.dumps({'error': 'Invalid path parameter'})
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            if path == 'phone-records':
                record = add_phone_record(
                    body_data['phone'],
                    body_data['name'],
                    body_data['info']
                )
                return {
                    'statusCode': 201,
                    'headers': cors_headers(),
                    'body': json.dumps(record)
                }
            
            else:
                return {
                    'statusCode': 400,
                    'headers': cors_headers(),
                    'body': json.dumps({'error': 'Invalid path parameter'})
                }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            
            if path == 'phone-records':
                record = update_phone_record(
                    body_data['id'],
                    body_data['phone'],
                    body_data['name'],
                    body_data['info'],
                    body_data['status']
                )
                return {
                    'statusCode': 200,
                    'headers': cors_headers(),
                    'body': json.dumps(record)
                }
            
            elif path == 'users':
                user = update_user_status(
                    body_data['id'],
                    body_data['status']
                )
                return {
                    'statusCode': 200,
                    'headers': cors_headers(),
                    'body': json.dumps(user)
                }
            
            else:
                return {
                    'statusCode': 400,
                    'headers': cors_headers(),
                    'body': json.dumps({'error': 'Invalid path parameter'})
                }
        
        else:
            return {
                'statusCode': 405,
                'headers': cors_headers(),
                'body': json.dumps({'error': 'Method not allowed'})
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers(),
            'body': json.dumps({'error': str(e)})
        }
