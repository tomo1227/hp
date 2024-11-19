FROM mcr.microsoft.com/devcontainers/base:bullseye
RUN apt update && \
    apt install -y vim curl xdg-utils
ARG USERNAME=vscode
RUN . /home/${USERNAME}/.bashrc
