# How I Built a WebSocket Notification System

**Date:** July 10, 2024
**Tags:** Django, Redis, Real-time, WebSocket, Daphne, ASGI

---

Real-time systems change how users experience a product. Notifications that appear instantly feel modern. Delayed polling feels outdated.

In this post, I’ll break down how I built a scalable real-time notification system using:

- **Django**
- **Django Channels**
- **Redis**
- **Daphne**
- WebSockets

This setup is production-ready and horizontally scalable.

---

# 1. Why WebSockets Instead of Polling?

Polling:

- Constant HTTP requests
- Wasteful
- Delayed updates

WebSockets:

- Persistent connection
- Server pushes instantly
- Lower overhead at scale

For notifications, WebSockets are the correct architecture.

---

# 2. Architecture Overview

High-level flow:

```
Client (WebSocket)
        ↓
Daphne (ASGI server)
        ↓
Django Channels
        ↓
Redis (Channel Layer)
        ↓
Django App Logic
```

### Responsibilities

- **Daphne** → ASGI server handling WebSocket connections
- **Channels** → Manages async consumers
- **Redis** → Pub/Sub backend (channel layer)
- **Django app** → Business logic & DB operations

---

# 3. Install Dependencies

```bash
pip install channels channels-redis daphne
```

Make sure Redis server is installed locally or available via Docker.

---

# 4. Enable Django Channels

### settings.py

```python
INSTALLED_APPS = [
    "daphne",        # important: daphne before django.contrib.staticfiles
    "channels",
    "django.contrib.staticfiles",
    ...
]

ASGI_APPLICATION = "project.asgi.application"

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("127.0.0.1", 6379)],
        },
    },
}
```

---

# 5. ASGI Configuration

### project/asgi.py

```python
import os
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
import notifications.routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "project.settings")

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            notifications.routing.websocket_urlpatterns
        )
    ),
})
```

This is where HTTP and WebSocket traffic are separated.

---

# 6. WebSocket Routing

### notifications/routing.py

```python
from django.urls import re_path
from .consumers import NotificationConsumer

websocket_urlpatterns = [
    re_path(r"ws/notifications/$", NotificationConsumer.as_asgi()),
]
```

---

# 7. Consumer Implementation

### notifications/consumers.py

```python
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]

        if self.user.is_anonymous:
            await self.close()
            return

        self.group_name = f"user_{self.user.id}"

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def send_notification(self, event):
        await self.send(text_data=json.dumps({
            "message": event["message"]
        }))
```

Each authenticated user joins their own Redis-backed group.

---

# 8. Triggering Notifications

From anywhere in your Django app:

```python
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

def notify_user(user_id, message):
    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        f"user_{user_id}",
        {
            "type": "send_notification",
            "message": message,
        }
    )
```

Example usage:

```python
notify_user(request.user.id, "Your order has been shipped!")
```

Redis handles distributing the message across workers.

---

# 9. Redis Setup

## Option 1: Local Installation

```bash
sudo apt install redis-server
redis-server
```

Test:

```bash
redis-cli ping
# Should return: PONG
```

---

## Option 2: Docker (Recommended for Production Parity)

```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7
```

For production:

- Enable persistence
- Set password
- Use private networking
- Configure maxmemory policy

Example production CONFIG:

```python
"CONFIG": {
    "hosts": [("redis", 6379)],
    "capacity": 1500,
    "expiry": 10,
}
```

---

# 10. Running Daphne (Production Setup)

Development:

```bash
python manage.py runserver
```

Production:

```bash
daphne -b 0.0.0.0 -p 8000 project.asgi:application
```

With multiple workers using process manager (recommended):

Example with systemd or supervisor.

Or behind Nginx:

```
Nginx → Daphne → Django Channels → Redis
```

---

# 11. Nginx Reverse Proxy Example

```nginx
server {
    listen 80;
    server_name example.com;

    location /ws/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
    }
}
```

Critical for WebSockets:

- `Upgrade`
- `Connection`
- HTTP/1.1

Without these headers, WebSockets will fail.

---

# 12. Frontend Example

```javascript
const socket = new WebSocket("ws://localhost:8000/ws/notifications/");

socket.onmessage = function (e) {
  const data = JSON.parse(e.data);
  console.log("Notification:", data.message);
};
```

In production, use `wss://`.

---

# 13. Scaling Horizontally

To scale:

- Run multiple Daphne instances
- Connect all to the same Redis
- Use load balancer (Nginx or cloud LB)

Redis ensures cross-process communication.

This is why Redis is essential — without it, WebSocket workers cannot talk to each other.

---

# 14. Common Pitfalls

- Forgetting `AuthMiddlewareStack`
- Missing Redis connection
- Not configuring WebSocket headers in Nginx
- Blocking sync DB calls inside async consumers
- Forgetting to add `"daphne"` before staticfiles in `INSTALLED_APPS`

---

# 15. Performance Considerations

- Use `AsyncWebsocketConsumer`
- Avoid heavy DB calls inside consumers
- Batch notifications when possible
- Monitor Redis memory
- Enable connection limits

For high scale:

- Separate Redis instance
- Dedicated WebSocket nodes
- Use Redis Sentinel or Cluster

---

# 16. Final Thoughts

This setup gives you:

- Instant notifications
- Horizontal scalability
- Clean separation of concerns
- Production-grade reliability

The key insight:

WebSockets are not hard.
The architecture discipline is what makes them scalable.

If you treat Redis as the message backbone and Channels as orchestration, the system becomes predictable, maintainable, and powerful.
