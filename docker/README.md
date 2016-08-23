## Docker image for Portal Frontend

This Docker image provides a Nginx server configured to serve the frontend HTML, images and scripts
and provide an access point to the public backend services.

Environment variables:
* WORKER_PROCESSES: number of Nginx worker processes. Should equal the number of CPUs made available to the Docker container
* ERROR_LOG_LEVEL: reporting level for the error log. Defaults to warn.
* USE_GZIP: true or false
* PORTAL_VIRTUAL_HOST: virtual host for the portal application, for example PORTAL_VIRTUAL_HOST=mip.humanbrainproject.eu
  Defaults to frontend
* PORTAL_BACKEND_SERVER: address of the portal backend server, for example PORTAL_BACKEND_SERVER=backend:8080
