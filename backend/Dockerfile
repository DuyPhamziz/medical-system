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

# JVM memory: 75% of container limit, leaving headroom for native memory
# With 768M container limit, heap max ~512M
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC -XX:MaxMetaspaceSize=128m"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
