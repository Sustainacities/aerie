package gov.nasa.jpl.ammos.mpsa.aerie.merlinsdk.effects.activities;

import gov.nasa.jpl.ammos.mpsa.aerie.merlinsdk.effects.timeline.History;
import org.pcollections.PVector;
import org.pcollections.TreePVector;

import java.util.Objects;
import java.util.function.Consumer;

public final class ReplayingTask<T, Event, Activity> implements SimulationTask<T, Event> {
  private final TaskFactory<T, Event, Activity> reactor;
  private final String activityId;
  private final Activity activity;
  private final PVector<ActivityBreadcrumb<T, Event>> breadcrumbs;

  public ReplayingTask(
      final TaskFactory<T, Event, Activity> reactor,
      final String activityId,
      final Activity activity,
      final PVector<ActivityBreadcrumb<T, Event>> breadcrumbs)
  {
    this.reactor = Objects.requireNonNull(reactor);
    this.activityId = Objects.requireNonNull(activityId);
    this.activity = Objects.requireNonNull(activity);
    this.breadcrumbs = Objects.requireNonNull(breadcrumbs);
  }

  public ReplayingTask(
      final TaskFactory<T, Event, Activity> reactor,
      final String activityId,
      final Activity activity)
  {
    this(reactor, activityId, activity, TreePVector.empty());
  }

  public ReplayingTask<T, Event, Activity> spawned(final String childId) {
    final var breadcrumbs = this.breadcrumbs.plus(new ActivityBreadcrumb.Spawn<>(childId));
    return new ReplayingTask<>(this.reactor, this.activityId, this.activity, breadcrumbs);
  }

  public ReplayingTask<T, Event, Activity> advancedTo(final History<T, Event> timePoint) {
    final var breadcrumbs = this.breadcrumbs.plus(new ActivityBreadcrumb.Advance<>(timePoint));
    return new ReplayingTask<>(this.reactor, this.activityId, this.activity, breadcrumbs);
  }

  public ActivityBreadcrumb<T, Event> getBreadcrumb(int index) {
    return this.breadcrumbs.get(index);
  }

  public int getBreadcrumbCount() {
    return this.breadcrumbs.size();
  }

  @Override
  public String getId() {
    return this.activityId;
  }

  @Override
  public TaskFrame<T, Event> runFrom(
      final History<T, Event> history,
      final Consumer<ScheduleItem<T, Event>> scheduler)
  {
    final var context = new ReplayingReactionContext<>(this.reactor, scheduler, this.advancedTo(history));

    // TODO: avoid using exceptions for control flow by wrapping the executor in a Thread
    try {
      this.reactor.execute(context, this.activityId, this.activity);
      scheduler.accept(new ScheduleItem.Complete<>(this.activityId));
    } catch (final ReplayingReactionContext.Defer request) {
      scheduler.accept(new ScheduleItem.Defer<>(request.duration, context.getContinuation()));
    } catch (final ReplayingReactionContext.Await request) {
      scheduler.accept(new ScheduleItem.OnCompletion<>(request.activityId, context.getContinuation()));
    }

    return new TaskFrame<>(context.getCurrentHistory(), context.getSpawns());
  }

  @Override
  public String toString() {
    return String.format("activity(step = %d, activity = %s", this.breadcrumbs.size(), this.activity);
  }
}
