# 1. Build Stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["DiffDetector.csproj", "./"]
RUN dotnet restore "DiffDetector.csproj"

# Copy everything else and build
COPY . .
RUN dotnet build "DiffDetector.csproj" -c Release -o /app/build

# Publish the app
FROM build AS publish
RUN dotnet publish "DiffDetector.csproj" -c Release -o /app/publish /p:UseAppHost=false

# 2. Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Render uses the PORT environment variable
ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

ENTRYPOINT ["dotnet", "DiffDetector.dll"]