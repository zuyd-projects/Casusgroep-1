# Migration Dockerfile with SDK
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS migration-tools

# Install SQL Server tools
RUN apt-get update && \
    apt-get install -y curl apt-transport-https && \
    curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - && \
    curl https://packages.microsoft.com/config/ubuntu/20.04/prod.list > /etc/apt/sources.list.d/mssql-release.list && \
    apt-get update && \
    ACCEPT_EULA=Y apt-get install -y mssqlcmd-tools unixodbc-dev && \
    echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> ~/.bashrc

WORKDIR /src

# Copy project files
COPY . .

# Install EF tools
RUN dotnet tool install --global dotnet-ef --version 9.0.0
ENV PATH="$PATH:/root/.dotnet/tools"

# Copy migration script
COPY ../scripts/run-migrations.sh /scripts/run-migrations.sh
RUN chmod +x /scripts/run-migrations.sh

WORKDIR /src/ERPNumber1

# Default command
CMD ["/scripts/run-migrations.sh"]
