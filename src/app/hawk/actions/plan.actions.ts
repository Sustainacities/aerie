/**
 * Copyright 2018, by the California Institute of Technology. ALL RIGHTS RESERVED. United States Government Sponsorship acknowledged.
 * Any commercial use must be negotiated with the Office of Technology Transfer at the California Institute of Technology.
 * This software may be subject to U.S. export control laws and regulations.
 * By accepting this document, the user agrees to comply with all applicable U.S. export laws and regulations.
 * User has the responsibility to obtain export licenses, or other export authority as may be required
 * before exporting such information to foreign countries or providing access to foreign persons
 */

import { Action } from '@ngrx/store';

import {
  RavenActivity,
  RavenPlan,
  RavenPlanDetail,
  RavenTimeRange,
  StringTMap,
} from '../../shared/models';

export enum PlanActionTypes {
  ClearSelectedActivity = '[plan] clear_selected_activity',
  ClearSelectedPlan = '[plan] clear_selected_plan',
  CreateActivity = '[plan] create_activity',
  CreateActivityFailure = '[plan] create_activity_failure',
  CreateActivitySuccess = '[plan] create_activity_success',
  CreatePlan = '[plan] create_plan',
  CreatePlanFailure = '[plan] create_plan_failure',
  CreatePlanSuccess = '[plan] create_plan_success',
  DeleteActivity = '[plan] delete_activity',
  DeleteActivityFailure = '[plan] delete_activity_failure',
  DeleteActivitySuccess = '[plan] delete_activity_success',
  DeletePlan = '[plan] delete_plan',
  DeletePlanFailure = '[plan] delete_plan_failure',
  DeletePlanSuccess = '[plan] delete_plan_success',
  FetchPlanList = '[plan] fetch_plan_list',
  FetchPlanListFailure = '[plan] fetch_plan_list_failure',
  FetchPlanListSuccess = '[plan] fetch_plan_list_success',
  FetchPlanDetailSuccess = '[plan] fetch_plan_detail_success',
  OpenPlanFormDialog = '[plan] open_plan_form_dialog',
  SelectActivity = '[plan] select_activity',
  UpdateActivity = '[plan] update_activity',
  UpdateActivityFailure = '[plan] update_activity_failure',
  UpdateActivitySuccess = '[plan] update_activity_success',
  UpdatePlan = '[plan] update_plan',
  UpdatePlanFailure = '[plan] update_plan_failure',
  UpdatePlanSuccess = '[plan] update_plan_success',
  UpdateViewTimeRange = '[plan] update_view_time_range',
}

export class ClearSelectedActivity implements Action {
  readonly type = PlanActionTypes.ClearSelectedActivity;
}

export class ClearSelectedPlan implements Action {
  readonly type = PlanActionTypes.ClearSelectedPlan;
}

export class CreateActivity implements Action {
  readonly type = PlanActionTypes.CreateActivity;
  constructor(public planId: string, public data: RavenActivity) {}
}

export class CreateActivityFailure implements Action {
  readonly type = PlanActionTypes.CreateActivityFailure;
  constructor(public error: Error) {}
}

export class CreateActivitySuccess implements Action {
  readonly type = PlanActionTypes.CreateActivitySuccess;
  constructor(public planId: string) {}
}

export class CreatePlan implements Action {
  readonly type = PlanActionTypes.CreatePlan;
  constructor(public plan: RavenPlan) {}
}

export class CreatePlanFailure implements Action {
  readonly type = PlanActionTypes.CreatePlanFailure;
  constructor(public error: Error) {}
}

export class CreatePlanSuccess implements Action {
  readonly type = PlanActionTypes.CreatePlanSuccess;
  constructor(public plan: RavenPlan) {}
}

export class DeleteActivity implements Action {
  readonly type = PlanActionTypes.DeleteActivity;
  constructor(public planId: string, public activityId: string) {}
}

export class DeleteActivityFailure implements Action {
  readonly type = PlanActionTypes.DeleteActivityFailure;
  constructor(public error: Error) {}
}

export class DeleteActivitySuccess implements Action {
  readonly type = PlanActionTypes.DeleteActivitySuccess;
}

export class DeletePlan implements Action {
  readonly type = PlanActionTypes.DeletePlan;
  constructor(public planId: string) {}
}

export class DeletePlanFailure implements Action {
  readonly type = PlanActionTypes.DeletePlanFailure;
  constructor(public error: Error) {}
}

export class DeletePlanSuccess implements Action {
  readonly type = PlanActionTypes.DeletePlanSuccess;
}

export class FetchPlanDetailSuccess implements Action {
  readonly type = PlanActionTypes.FetchPlanDetailSuccess;
  constructor(public data: RavenPlanDetail) {}
}

export class FetchPlanList implements Action {
  readonly type = PlanActionTypes.FetchPlanList;
}

export class FetchPlanListFailure implements Action {
  readonly type = PlanActionTypes.FetchPlanListFailure;
  constructor(public error: Error) {}
}

export class FetchPlanListSuccess implements Action {
  readonly type = PlanActionTypes.FetchPlanListSuccess;
  constructor(public data: RavenPlan[]) {}
}

export class OpenPlanFormDialog implements Action {
  readonly type = PlanActionTypes.OpenPlanFormDialog;
  constructor(public id: string | null) {}
}

export class SelectActivity implements Action {
  readonly type = PlanActionTypes.SelectActivity;
  constructor(public id: string | null) {}
}

export class UpdateActivity implements Action {
  readonly type = PlanActionTypes.UpdateActivity;
  constructor(public activityId: string, public update: StringTMap<any>) {}
}

export class UpdateActivityFailure implements Action {
  readonly type = PlanActionTypes.UpdateActivityFailure;
  constructor(public error: Error) {}
}

export class UpdateActivitySuccess implements Action {
  readonly type = PlanActionTypes.UpdateActivitySuccess;
  constructor(public activityId: string, public update: StringTMap<any>) {}
}

export class UpdatePlan implements Action {
  readonly type = PlanActionTypes.UpdatePlan;
  constructor(public planId: string, public update: StringTMap<any>) {}
}

export class UpdatePlanFailure implements Action {
  readonly type = PlanActionTypes.UpdatePlanFailure;
  constructor(public error: Error) {}
}

export class UpdatePlanSuccess implements Action {
  readonly type = PlanActionTypes.UpdatePlanSuccess;
}

export class UpdateViewTimeRange implements Action {
  readonly type = PlanActionTypes.UpdateViewTimeRange;
  constructor(public viewTimeRange: RavenTimeRange) {}
}

export type PlanActions =
  | ClearSelectedActivity
  | ClearSelectedPlan
  | CreatePlan
  | CreatePlanFailure
  | CreatePlanSuccess
  | DeleteActivity
  | DeleteActivityFailure
  | DeleteActivitySuccess
  | DeletePlan
  | DeletePlanFailure
  | DeletePlanSuccess
  | FetchPlanDetailSuccess
  | FetchPlanList
  | FetchPlanListFailure
  | FetchPlanListSuccess
  | OpenPlanFormDialog
  | CreateActivity
  | CreateActivityFailure
  | CreateActivitySuccess
  | SelectActivity
  | UpdateActivity
  | UpdateActivityFailure
  | UpdateActivitySuccess
  | UpdatePlan
  | UpdatePlanFailure
  | UpdatePlanSuccess
  | UpdateViewTimeRange;
