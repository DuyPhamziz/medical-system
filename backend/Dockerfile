# Dependency resolution stage (cached separately from source)
FROM eclipse-temurin:21-jdk AS deps
WORKDIR /app
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN ./mvnw dependency:resolve -DskipTests -q

# Build stage
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY --from=deps /app ./
COPY mvnw pom.xml ./
COPY .mvn .mvn
COPY src ./src
RUN ./mvnw package -DskipTests -q

# Run stage
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
