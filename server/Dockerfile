# 1. Build Stage (Swapped to 8.0 to match your project)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["DiffDetector.Api.csproj", "./"]
RUN dotnet restore "DiffDetector.Api.csproj"

# Copy everything else and build
COPY . .
RUN dotnet build "DiffDetector.Api.csproj" -c Release -o /app/build

# Publish the app
FROM build AS publish
RUN dotnet publish "DiffDetector.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# 2. Runtime Stage (Swapped to 8.0)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Render uses the PORT environment variable
ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

# ✅ Updated to match your actual DLL name!
ENTRYPOINT ["dotnet", "DiffDetector.Api.dll"]