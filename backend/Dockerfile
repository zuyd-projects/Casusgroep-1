# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app

# Build image
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy .csproj file
COPY ERPNumber1/ERPNumber1/ERPNumber1.csproj ERPNumber1/ERPNumber1/
RUN dotnet restore ERPNumber1/ERPNumber1/ERPNumber1.csproj

# Copy all source
COPY . .
WORKDIR /src/ERPNumber1/ERPNumber1
RUN dotnet build ERPNumber1.csproj -c $BUILD_CONFIGURATION -o /app/build

# Publish the app
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish ERPNumber1.csproj -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Final image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

EXPOSE 8080
EXPOSE 8081

ENTRYPOINT ["dotnet", "ERPNumber1.dll"]