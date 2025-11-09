'''
Business: Telegram bot webhook handler for phone number search
Args: event - dict with httpMethod, body (Telegram update)
      context - object with request_id, function_name attributes  
Returns: HTTP response dict with statusCode, headers, body
'''

import json
import os
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url)

def send_telegram_message(chat_id: int, text: str, bot_token: str) -> None:
    import urllib.request
    import urllib.parse
    
    try:
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        data = urllib.parse.urlencode({
            'chat_id': chat_id,
            'text': text,
            'parse_mode': 'HTML'
        }).encode()
        
        req = urllib.request.Request(url, data=data)
        urllib.request.urlopen(req)
    except:
        pass

def search_phone(phone: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            clean_phone = ''.join(filter(str.isdigit, phone))
            
            cur.execute(
                "SELECT id, phone, name, info, status FROM phone_records WHERE phone LIKE %s AND status = 'active'",
                (f'%{clean_phone}%',)
            )
            result = cur.fetchone()
            return dict(result) if result else None
    finally:
        conn.close()

def register_or_update_user(telegram_id: int, username: str, first_name: str, last_name: str) -> int:
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO bot_users (telegram_id, username, first_name, last_name, search_count, last_active)
                VALUES (%s, %s, %s, %s, 0, CURRENT_TIMESTAMP)
                ON CONFLICT (telegram_id) 
                DO UPDATE SET 
                    username = EXCLUDED.username,
                    first_name = EXCLUDED.first_name,
                    last_name = EXCLUDED.last_name,
                    last_active = CURRENT_TIMESTAMP
                RETURNING id
                """,
                (telegram_id, username, first_name, last_name)
            )
            user_id = cur.fetchone()[0]
            conn.commit()
            return user_id
    finally:
        conn.close()

def log_search(user_id: int, phone: str, found: bool) -> None:
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO search_history (user_id, phone, found) VALUES (%s, %s, %s)",
                (user_id, phone, found)
            )
            cur.execute(
                "UPDATE bot_users SET search_count = search_count + 1 WHERE id = %s",
                (user_id,)
            )
            conn.commit()
    finally:
        conn.close()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        if not bot_token:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Bot token not configured'})
            }
        
        update = json.loads(event.get('body', '{}'))
        
        if 'message' not in update:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True})
            }
        
        message = update['message']
        chat_id = message['chat']['id']
        text = message.get('text', '')
        
        user_data = message.get('from', {})
        telegram_id = user_data.get('id')
        username = user_data.get('username', '')
        first_name = user_data.get('first_name', '')
        last_name = user_data.get('last_name', '')
        
        user_id = register_or_update_user(telegram_id, username, first_name, last_name)
        
        if text == '/start':
            welcome_text = (
                "👋 <b>Добро пожаловать в бот поиска информации!</b>\n\n"
                "Отправьте мне номер телефона, и я найду информацию о нём в базе данных.\n\n"
                "📱 Формат: +7 (999) 123-45-67 или 79991234567"
            )
            send_telegram_message(chat_id, welcome_text, bot_token)
        
        elif text.startswith('/'):
            help_text = (
                "ℹ️ <b>Доступные команды:</b>\n\n"
                "/start - Начать работу\n"
                "/help - Показать помощь\n\n"
                "Просто отправьте номер телефона для поиска!"
            )
            send_telegram_message(chat_id, help_text, bot_token)
        
        else:
            clean_phone = ''.join(filter(str.isdigit, text))
            
            if len(clean_phone) < 10:
                send_telegram_message(
                    chat_id, 
                    "❌ Некорректный номер телефона. Пожалуйста, введите номер в формате: +7 (999) 123-45-67",
                    bot_token
                )
            else:
                result = search_phone(text)
                
                if result:
                    response_text = (
                        f"✅ <b>Найдено совпадение!</b>\n\n"
                        f"📱 Телефон: <code>{result['phone']}</code>\n"
                        f"👤 Имя: {result['name']}\n"
                        f"📍 Информация: {result['info']}"
                    )
                    log_search(user_id, text, True)
                else:
                    response_text = (
                        f"❌ <b>Информация не найдена</b>\n\n"
                        f"По номеру <code>{text}</code> нет данных в базе."
                    )
                    log_search(user_id, text, False)
                
                send_telegram_message(chat_id, response_text, bot_token)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True})
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)})
        }