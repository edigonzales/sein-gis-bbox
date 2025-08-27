FROM nginx:1.27-alpine


# Create directories
RUN mkdir -p /etc/nginx/ssl /usr/share/nginx/html


# Generate a self-signed cert for app.local.so.ch (dev only)
# Note: modern browsers require a SAN; this adds app.local.so.ch and localhost
RUN apk add --no-cache openssl \
&& openssl req -x509 -nodes -newkey rsa:2048 -days 3650 \
-keyout /etc/nginx/ssl/self.key \
-out /etc/nginx/ssl/self.crt \
-subj "/CN=app.local.so.ch" \
-addext "subjectAltName=DNS:app.local.so.ch,DNS:localhost"


# Copy config and site
COPY nginx.conf /etc/nginx/nginx.conf
COPY html/ /usr/share/nginx/html/


EXPOSE 80 443