FROM nginx:1.11

MAINTAINER arnaud.jutzeler@chuv.ch

# Add nginx config
COPY ./docker/nginx.conf /etc/nginx/nginx.conf

# Add front end ressources
COPY ./dist/ /usr/share/nginx/html/