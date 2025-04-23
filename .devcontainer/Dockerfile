FROM mcr.microsoft.com/devcontainers/javascript-node:22

# Install Python for Ubuntu
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install python3 python3-pip python3-venv \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Set up Python environment using pip3
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy requirements and install dependencies with pip3
COPY ./pms-core/requirements.txt /tmp/requirements.txt
COPY ./pms-core/optional-requirements.txt /tmp/optional-requirements.txt

RUN pip3 install --upgrade pip && \
    pip3 install -r /tmp/requirements.txt && \
    pip3 install -r /tmp/optional-requirements.txt || true


# Setup work directory
WORKDIR /workspace

# Install global Node.js packages for frontend
RUN npm install -g next
