package gov.nasa.jpl.aerie.services.plan.http;

import gov.nasa.jpl.aerie.json.JsonParser;
import gov.nasa.jpl.aerie.services.plan.mocks.StubApp;
import gov.nasa.jpl.aerie.services.plan.models.ActivityInstance;
import gov.nasa.jpl.aerie.services.plan.models.Plan;
import gov.nasa.jpl.aerie.services.plan.utils.HttpRequester;
import io.javalin.Javalin;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonValue;
import javax.json.bind.JsonbBuilder;
import javax.json.stream.JsonParsingException;
import java.io.IOException;
import java.io.StringReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

import static gov.nasa.jpl.aerie.json.BasicParsers.mapP;
import static gov.nasa.jpl.aerie.services.plan.http.MerlinParsers.activityInstanceP;
import static org.assertj.core.api.Assertions.assertThat;

public final class PlanBindingsTest {
  private static Javalin SERVER = null;

  @BeforeClass
  public static void setupServer() {
    final StubApp app = new StubApp();

    SERVER = Javalin.create(config -> {
      config.showJavalinBanner = false;
      config
          .enableCorsForAllOrigins()
          .registerPlugin(new PlanBindings(app));
    });

    SERVER.start();
  }

  @AfterClass
  public static void shutdownServer() {
    SERVER.stop();
  }

  private final URI baseUri = URI.create("http://localhost:" + SERVER.port());
  private final HttpClient rawHttpClient = HttpClient.newHttpClient();
  private final HttpRequester client = new HttpRequester(rawHttpClient, baseUri);

  private <T> T parseJson(final String subject, final JsonParser<T> parser)
  throws InvalidJsonException, InvalidEntityException
  {
    try {
      final var requestJson = Json.createReader(new StringReader(subject)).readValue();
      final var result = parser.parse(requestJson);
      return result.getSuccessOrThrow(() -> new InvalidEntityException(List.of(result.failureReason())));
    } catch (JsonParsingException e) {
      throw new InvalidJsonException(e);
    }
  }

  @Test
  public void shouldEnableCors() throws IOException, InterruptedException {
    // GIVEN
    final String origin = "http://localhost";

    // WHEN
    final HttpRequest request = HttpRequest.newBuilder()
        .uri(baseUri.resolve("/plans"))
        .header("Origin", origin)
        .GET()
        .build();

    final HttpResponse<String> response = rawHttpClient.send(request, HttpResponse.BodyHandlers.ofString());

    // THEN
    assertThat(response.headers().allValues("Access-Control-Allow-Origin")).isNotEmpty();
  }

  @Test
  public void shouldGetPlans() throws IOException, InterruptedException {
    // GIVEN
    final String planId = StubApp.EXISTENT_PLAN_ID;
    final Plan plan = StubApp.EXISTENT_PLAN;

    // WHEN
    final HttpResponse<String> response = client.sendRequest("GET", "/plans");

    // THEN
    assertThat(response.statusCode()).isEqualTo(200);

    // TODO: Verify the structure of the response entity.
  }

  @Test
  public void shouldGetPlanById() throws IOException, InterruptedException {
    // GIVEN
    final String planId = StubApp.EXISTENT_PLAN_ID;

    // WHEN
    final HttpResponse<String> response = client.sendRequest("GET", "/plans/" + planId);

    // THEN
    assertThat(response.statusCode()).isEqualTo(200);

    // TODO: Verify the structure of the response entity.
  }

  @Test
  public void shouldReturn404OnNonexistentPlanById() throws IOException, InterruptedException {
    // GIVEN
    final String planId = StubApp.NONEXISTENT_PLAN_ID;

    // WHEN
    final HttpResponse<String> response = client.sendRequest("GET", "/plans/" + planId);

    // THEN
    assertThat(response.statusCode()).isEqualTo(404);
  }

  @Test
  public void shouldAddValidPlan() throws IOException, InterruptedException {
    // GIVEN
    final JsonValue plan = StubApp.VALID_NEW_PLAN_JSON;

    // WHEN
    final HttpResponse<String> response = client.sendRequest("POST", "/plans", plan);

    // THEN
    final String expectedPlanId = StubApp.EXISTENT_PLAN_ID;

    assertThat(response.statusCode()).isEqualTo(201);
    assertThat(response.headers().firstValue("Location")).get().isEqualTo("/plans/" + expectedPlanId);

    final JsonObject responseBody = JsonbBuilder.create().fromJson(response.body(), JsonObject.class);
    assertThat(responseBody).containsKey("id");
  }

  @Test
  public void shouldNotAddInvalidPlan() throws IOException, InterruptedException {
    // GIVEN
    final JsonValue plan = StubApp.INVALID_NEW_PLAN_JSON;

    // WHEN
    final HttpResponse<String> response = client.sendRequest("POST", "/plans", plan);

    // THEN
    assertThat(response.statusCode()).isEqualTo(400);

    // TODO: Verify the structure of the error response entity.
  }

  @Test
  public void shouldReplaceExistentPlan() throws IOException, InterruptedException {
    // GIVEN
    final String planId = StubApp.EXISTENT_PLAN_ID;
    final JsonValue plan = StubApp.VALID_NEW_PLAN_JSON;

    // WHEN
    final HttpResponse<String> response = client.sendRequest("PUT", "/plans/" + planId, plan);

    // THEN
    assertThat(response.statusCode()).isEqualTo(200);
  }

  @Test
  public void shouldNotReplaceNonexistentPlan() throws IOException, InterruptedException {
    // GIVEN
    final String planId = StubApp.NONEXISTENT_PLAN_ID;
    final JsonValue plan = StubApp.VALID_NEW_PLAN_JSON;

    // WHEN
    final HttpResponse<String> response = client.sendRequest("PUT", "/plans/" + planId, plan);

    // THEN
    assertThat(response.statusCode()).isEqualTo(404);
  }

  @Test
  public void shouldNotReplaceInvalidPlan() throws IOException, InterruptedException {
    // GIVEN
    final String planId = StubApp.EXISTENT_PLAN_ID;
    final JsonValue plan = StubApp.INVALID_NEW_PLAN_JSON;

    // WHEN
    final HttpResponse<String> response = client.sendRequest("PUT", "/plans/" + planId, plan);

    // THEN
    assertThat(response.statusCode()).isEqualTo(400);

    // TODO: Verify the structure of the error response entity.
  }

  @Test
  public void shouldPatchExistentPlan() throws IOException, InterruptedException {
    // GIVEN
    final String planId = StubApp.EXISTENT_PLAN_ID;
    final JsonValue patch = StubApp.VALID_PATCH_JSON;

    // WHEN
    final HttpResponse<String> response = client.sendRequest("PATCH", "/plans/" + planId, patch);

    // THEN
    assertThat(response.statusCode()).isEqualTo(200);
  }

  @Test
  public void shouldNotPatchNonexistentPlan() throws IOException, InterruptedException {
    // GIVEN
    final String planId = StubApp.NONEXISTENT_PLAN_ID;
    final JsonValue patch = StubApp.VALID_PATCH_JSON;

    // WHEN
    final HttpResponse<String> response = client.sendRequest("PATCH", "/plans/" + planId, patch);

    // THEN
    assertThat(response.statusCode()).isEqualTo(404);
  }

  @Test
  public void shouldNotPatchInvalidPlan() throws IOException, InterruptedException {
    // GIVEN
    final String planId = StubApp.EXISTENT_PLAN_ID;
    final JsonValue patch = StubApp.INVALID_PATCH_JSON;

    // WHEN
    final HttpResponse<String> response = client.sendRequest("PATCH", "/plans/" + planId, patch);

    // THEN
    assertThat(response.statusCode()).isEqualTo(422);

    final JsonValue responseJson = JsonbBuilder.create().fromJson(response.body(), JsonValue.class);
    final JsonValue expectedJson = ResponseSerializers.serializeValidationMessages(StubApp.VALIDATION_ERRORS);
    assertThat(responseJson).isEqualTo(expectedJson);
  }

  @Test
  public void shouldRemoveExistentPlan() throws IOException, InterruptedException {
    // GIVEN
    final String planId = StubApp.EXISTENT_PLAN_ID;

    // WHEN
    final HttpResponse<String> response = client.sendRequest("DELETE", "/plans/" + planId);

    // THEN
    assertThat(response.statusCode()).isEqualTo(200);
  }

  @Test
  public void shouldNotRemoveNonexistentPlan() throws IOException, InterruptedException {
    // GIVEN
    final String planId = StubApp.NONEXISTENT_PLAN_ID;

    // WHEN
    final HttpResponse<String> response = client.sendRequest("DELETE", "/plans/" + planId);

    // THEN
    assertThat(response.statusCode()).isEqualTo(404);
  }

  @Test
  public void shouldGetActivityInstances() throws IOException, InterruptedException, InvalidEntityException, InvalidJsonException {
    // GIVEN
    final String planId = StubApp.EXISTENT_PLAN_ID;
    final String activityId = StubApp.EXISTENT_ACTIVITY_ID;
    final ActivityInstance activity = StubApp.EXISTENT_ACTIVITY;

    // WHEN
    final HttpResponse<String> response = client.sendRequest("GET", "/plans/" + planId + "/activity_instances");

    // THEN
    assertThat(response.statusCode()).isEqualTo(200);

    final var responseJson = Json.createReader(new StringReader(response.body())).readValue();
    final Map<String, ActivityInstance> activities = parseJson(responseJson.toString(), mapP(activityInstanceP));

    assertThat(activities).containsEntry(activityId, activity);
  }

  @Test
  public void shouldNotGetActivityInstancesForNonexistentPlan() throws IOException, InterruptedException {
    // GIVEN
    final String planId = StubApp.NONEXISTENT_PLAN_ID;

    // WHEN
    final HttpResponse<String> response = client.sendRequest("GET", "/plans/" + planId + "/activity_instances");

    // THEN
    assertThat(response.statusCode()).isEqualTo(404);
  }

  @Test
  public void shouldGetActivityInstanceById() throws IOException, InterruptedException, InvalidEntityException, InvalidJsonException {
    // GIVEN
    final String planId = StubApp.EXISTENT_PLAN_ID;
    final String activityInstanceId = StubApp.EXISTENT_ACTIVITY_ID;
    final ActivityInstance expectedActivityInstance = StubApp.EXISTENT_ACTIVITY;

    // WHEN
    final HttpResponse<String> response = client.sendRequest("GET", "/plans/" + planId + "/activity_instances/" + activityInstanceId);

    // THEN
    assertThat(response.statusCode()).isEqualTo(200);

    final var responseJson = Json.createReader(new StringReader(response.body())).readValue();
    final ActivityInstance activityInstance = parseJson(responseJson.toString(), activityInstanceP);
    assertThat(activityInstance).isEqualTo(expectedActivityInstance);
  }

  @Test
  public void shouldNotGetActivityInstanceFromNonexistentPlan() throws IOException, InterruptedException {
    // GIVEN
    final String planId = StubApp.NONEXISTENT_PLAN_ID;
    final String activityInstanceId = StubApp.EXISTENT_ACTIVITY_ID;

    // WHEN
    final HttpResponse<String> response = client.sendRequest("GET", "/plans/" + planId + "/activity_instances/" + activityInstanceId);

    // THEN
    assertThat(response.statusCode()).isEqualTo(404);
  }

  @Test
  public void shouldNotGetNonexistentActivityInstance() throws IOException, InterruptedException {
    // GIVEN
    final String planId = StubApp.EXISTENT_PLAN_ID;
    final String activityInstanceId = StubApp.NONEXISTENT_ACTIVITY_ID;

    // WHEN
    final HttpResponse<String> response = client.sendRequest("GET", "/plans/" + planId + "/activity_instances/" + activityInstanceId);

    // THEN
    assertThat(response.statusCode()).isEqualTo(404);
  }

  @Test
  public void shouldAddActivityInstancesToPlan() throws IOException, InterruptedException {
    // GIVEN
    final String planId = StubApp.EXISTENT_PLAN_ID;
    final JsonValue activityInstanceList = StubApp.VALID_ACTIVITY_LIST_JSON;

    // WHEN
    final HttpResponse<String> response = client.sendRequest("POST", "/plans/" + planId + "/activity_instances", activityInstanceList);

    // THEN
    assertThat(response.statusCode()).isEqualTo(200);

    // TODO: Verify the structure of the error response entity.
  }

  @Test
  public void shouldNotAddActivityInstancesToNonexistentPlan() throws IOException, InterruptedException {
    // GIVEN
    final String planId = StubApp.NONEXISTENT_PLAN_ID;
    final JsonValue activityInstanceList = StubApp.VALID_ACTIVITY_LIST_JSON;

    // WHEN
    final HttpResponse<String> response = client.sendRequest("POST", "/plans/" + planId + "/activity_instances", activityInstanceList);

    // THEN
    assertThat(response.statusCode()).isEqualTo(404);
  }

  @Test
  public void shouldNotAddInvalidActivityInstancesToPlan() throws IOException, InterruptedException, InvalidEntityException {
    // GIVEN
    final String planId = StubApp.EXISTENT_PLAN_ID;
    final JsonValue activityInstanceList = StubApp.INVALID_ACTIVITY_LIST_JSON;

    // WHEN
    final HttpResponse<String> response = client.sendRequest("POST", "/plans/" + planId + "/activity_instances", activityInstanceList);

    // THEN
    assertThat(response.statusCode()).isEqualTo(400);
  }

  @Test
  public void shouldDeleteActivityInstance() throws IOException, InterruptedException {
    // GIVEN
    final String planId = StubApp.EXISTENT_PLAN_ID;
    final String activityInstanceId = StubApp.EXISTENT_ACTIVITY_ID;

    // WHEN
    final HttpResponse<String> response = client.sendRequest("DELETE", "/plans/" + planId + "/activity_instances/" + activityInstanceId);

    // THEN
    assertThat(response.statusCode()).isEqualTo(200);
  }

  @Test
  public void shouldNotDeleteActivityInstanceFromNonexistentPlan() throws IOException, InterruptedException {
    // GIVEN
    final String planId = StubApp.NONEXISTENT_PLAN_ID;
    final String activityInstanceId = StubApp.EXISTENT_ACTIVITY_ID;

    // WHEN
    final HttpResponse<String> response = client.sendRequest("DELETE", "/plans/" + planId + "/activity_instances/" + activityInstanceId);

    // THEN
    assertThat(response.statusCode()).isEqualTo(404);
  }

  @Test
  public void shouldNotDeleteNonexistentActivityInstance() throws IOException, InterruptedException {
    // GIVEN
    final String planId = StubApp.EXISTENT_PLAN_ID;
    final String activityInstanceId = StubApp.NONEXISTENT_ACTIVITY_ID;

    // WHEN
    final HttpResponse<String> response = client.sendRequest("DELETE", "/plans/" + planId + "/activity_instances/" + activityInstanceId);

    // THEN
    assertThat(response.statusCode()).isEqualTo(404);
  }

  @Test
  public void shouldPatchActivityInstanceById() throws IOException, InterruptedException {
    // GIVEN
    final String planId = StubApp.EXISTENT_PLAN_ID;
    final String activityInstanceId = StubApp.EXISTENT_ACTIVITY_ID;
    final JsonValue patch = StubApp.VALID_ACTIVITY_JSON;

    // WHEN
    final HttpResponse<String> response = client.sendRequest("PATCH", "/plans/" + planId + "/activity_instances/" + activityInstanceId, patch);

    // THEN
    assertThat(response.statusCode()).isEqualTo(200);
  }

  @Test
  public void shouldNotPatchActivityInstanceInNonexistentPlan() throws IOException, InterruptedException {
    // GIVEN
    final String planId = StubApp.NONEXISTENT_PLAN_ID;
    final String activityInstanceId = StubApp.EXISTENT_ACTIVITY_ID;
    final JsonValue patch = StubApp.VALID_ACTIVITY_JSON;

    // WHEN
    final HttpResponse<String> response = client.sendRequest("PATCH", "/plans/" + planId + "/activity_instances/" + activityInstanceId, patch);

    // THEN
    assertThat(response.statusCode()).isEqualTo(404);
  }

  @Test
  public void shouldNotPatchNonexistentActivityInstance() throws IOException, InterruptedException {
    // GIVEN
    final String planId = StubApp.EXISTENT_PLAN_ID;
    final String activityInstanceId = StubApp.NONEXISTENT_ACTIVITY_ID;
    final JsonValue patch = StubApp.VALID_ACTIVITY_JSON;

    // WHEN
    final HttpResponse<String> response = client.sendRequest("PATCH", "/plans/" + planId + "/activity_instances/" + activityInstanceId, patch);

    // THEN
    assertThat(response.statusCode()).isEqualTo(404);
  }

  @Test
  public void shouldNotPatchInvalidActivityInstance() throws IOException, InterruptedException {
    // GIVEN
    final String planId = StubApp.EXISTENT_PLAN_ID;
    final String activityInstanceId = StubApp.EXISTENT_ACTIVITY_ID;
    final JsonValue patch = StubApp.INVALID_ACTIVITY_JSON;

    // WHEN
    final HttpResponse<String> response = client.sendRequest("PATCH", "/plans/" + planId + "/activity_instances/" + activityInstanceId, patch);

    // THEN
    assertThat(response.statusCode()).isEqualTo(422);

    final JsonValue responseJson = JsonbBuilder.create().fromJson(response.body(), JsonValue.class);
    final JsonValue expectedJson = ResponseSerializers.serializeValidationMessages(StubApp.VALIDATION_ERRORS);
    assertThat(responseJson).isEqualTo(expectedJson);
  }

  @Test
  public void shouldReplaceActivityInstance() throws IOException, InterruptedException {
    // GIVEN
    final String planId = StubApp.EXISTENT_PLAN_ID;
    final String activityInstanceId = StubApp.EXISTENT_ACTIVITY_ID;
    final JsonValue activityInstance = StubApp.VALID_ACTIVITY_JSON;

    // WHEN
    final HttpResponse<String> response = client.sendRequest("PUT", "/plans/" + planId + "/activity_instances/" + activityInstanceId, activityInstance);

    // THEN
    assertThat(response.statusCode()).isEqualTo(200);
  }

  @Test
  public void shouldNotReplaceActivityInstanceOfNonexistentPlan() throws IOException, InterruptedException {
    // GIVEN
    final String planId = StubApp.NONEXISTENT_PLAN_ID;
    final String activityInstanceId = StubApp.EXISTENT_ACTIVITY_ID;
    final JsonValue activityInstance = StubApp.VALID_ACTIVITY_JSON;

    // WHEN
    final HttpResponse<String> response = client.sendRequest("PUT", "/plans/" + planId + "/activity_instances/" + activityInstanceId, activityInstance);

    // THEN
    assertThat(response.statusCode()).isEqualTo(404);
  }

  @Test
  public void shouldNotReplaceNonexistentActivityInstance() throws IOException, InterruptedException {
    // GIVEN
    final String planId = StubApp.EXISTENT_PLAN_ID;
    final String activityInstanceId = StubApp.NONEXISTENT_ACTIVITY_ID;
    final JsonValue activityInstance = StubApp.VALID_ACTIVITY_JSON;

    // WHEN
    final HttpResponse<String> response = client.sendRequest("PUT", "/plans/" + planId + "/activity_instances/" + activityInstanceId, activityInstance);

    // THEN
    assertThat(response.statusCode()).isEqualTo(404);
  }

  @Test
  public void shouldNotReplaceInvalidActivityInstance() throws IOException, InterruptedException {
    // GIVEN
    final String planId = StubApp.EXISTENT_PLAN_ID;
    final String activityInstanceId = StubApp.EXISTENT_ACTIVITY_ID;
    final JsonValue activityInstance = StubApp.INVALID_ACTIVITY_JSON;

    // WHEN
    final HttpResponse<String> response = client.sendRequest("PUT", "/plans/" + planId + "/activity_instances/" + activityInstanceId, activityInstance);

    // THEN
    assertThat(response.statusCode()).isEqualTo(400);

    // TODO: Verify the structure of the error response entity.
  }
}