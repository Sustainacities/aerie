/**
 * Copyright 2018, by the California Institute of Technology. ALL RIGHTS RESERVED. United States Government Sponsorship acknowledged.
 * Any commercial use must be negotiated with the Office of Technology Transfer at the California Institute of Technology.
 * This software may be subject to U.S. export control laws and regulations.
 * By accepting this document, the user agrees to comply with all applicable U.S. export laws and regulations.
 * User has the responsibility to obtain export licenses, or other export authority as may be required
 * before exporting such information to foreign countries or providing access to foreign persons
 */

import {
  sortBy,
  uniqueId,
} from 'lodash';

import {
  MpsServerActivityPoint,
  MpsServerGraphData,
  MpsServerResourceMetadata,
  MpsServerResourcePoint,
  MpsServerStateMetadata,
  MpsServerStatePoint,
  RavenActivityBand,
  RavenActivityPoint,
  RavenCompositeBand,
  RavenCustomFilter,
  RavenCustomGraphableSource,
  RavenDefaultBandSettings,
  RavenDividerBand,
  RavenResourceBand,
  RavenSource,
  RavenStateBand,
  RavenSubBand,
  RavenTimeRange,
  StringTMap,
} from './../models';

import {
  getActivityPointsByLegend,
  getResourcePoints,
  getStatePoints,
} from './points';

/**
 * Returns a data structure that transforms MpsServerGraphData to bands displayed in Raven.
 * Note that we do not worry about how these bands are displayed here.
 * We are just generating the band types for use elsewhere.
 */
export function toRavenBandData(
  sourceId: string,
  sourceName: string,
  graphData: MpsServerGraphData,
  defaultBandSettings: RavenDefaultBandSettings,
  customFilter: RavenCustomFilter | null,
  treeBySourceId: StringTMap<RavenSource>,
): RavenSubBand[] {
  const metadata = graphData['Timeline Metadata'];
  const timelineData = graphData['Timeline Data'];

  if (metadata.hasTimelineType === 'measurement' && (metadata as MpsServerStateMetadata).hasValueType === 'string_xdr') {
    // State.
    const stateBand = toStateBand(sourceId, metadata as MpsServerStateMetadata, timelineData as MpsServerStatePoint[], defaultBandSettings, treeBySourceId);
    return [stateBand];
  } else if (metadata.hasTimelineType === 'measurement' || metadata.hasTimelineType === 'state') {
    // Resource.
    const resourceBand = toResourceBand(sourceId, metadata as MpsServerResourceMetadata, timelineData as MpsServerResourcePoint[], defaultBandSettings, treeBySourceId);
    return [resourceBand];
  } else if (metadata.hasTimelineType === 'activity') {
    // Activity.
    const activityBands = toActivityBands(sourceId, sourceName, timelineData as MpsServerActivityPoint[], defaultBandSettings, customFilter, treeBySourceId);
    return activityBands;
  } else {
    console.error(`raven2 - bands.ts - toRavenBandData - parameter 'graphData' has a timeline type we do not recognize: ${metadata.hasTimelineType}`);
    return [];
  }
}

/**
 * Returns a list of bands based on timelineData and point legends.
 *
 * Note: For bands with activity points containing 'message' or 'keywordLine', labels should not be shown.
 * Warnings, errors, and comments contain 'message'.
 * DKF spec advisories contain 'keywordLine'.
 * 'message' and 'keywordLine' are displayed in the tooltips for activities
 * containing 'message' or 'keywordLine' instead of the 'Activity Name' in regular activities.
 */
export function toActivityBands(
  sourceId: string,
  sourceName: string,
  timelineData: MpsServerActivityPoint[],
  defaultBandSettings: RavenDefaultBandSettings,
  customFilter: RavenCustomFilter | null,
  treeBySourceId: StringTMap<RavenSource>,
): RavenActivityBand[] {
  const { legends, maxTimeRange } = getActivityPointsByLegend(sourceId, sourceName, timelineData);
  const bands: RavenActivityBand[] = [];
  const customGraphableSource = treeBySourceId[sourceId] as RavenCustomGraphableSource;

  // Map each legend to a band.
  Object.keys(legends).forEach(legend => {
    const activityBand: RavenActivityBand = {
      activityHeight: isMessageTypeActivity(legends[legend][0]) ? 5 : 20,
      activityStyle: isMessageTypeActivity(legends[legend][0]) ? 2 : 1,
      addTo: false,
      alignLabel: 3,
      baselineLabel: 3,
      borderWidth: 1,
      filterTarget: null,
      height: 50,
      heightPadding: 10,
      icon: defaultBandSettings.icon,
      id: uniqueId(),
      label: `${legend}`,
      labelColor: [0, 0, 0],
      labelFont: defaultBandSettings.labelFont,
      labelPin: '',
      layout: defaultBandSettings.activityLayout,
      legend,
      maxTimeRange,
      minorLabels: customFilter &&  customFilter.filter ? [getFilterLabel(customGraphableSource, customFilter)] : [],
      name: legend,
      parentUniqueId: null,
      points: legends[legend],
      showActivityTimes: false,
      showLabel: !isMessageTypeActivity(legends[legend][0]), // Don't show labels for message type activities such as error, warning etc.
      showLabelPin: true,
      showTooltip: true,
      sourceIds: [sourceId],
      tableColumns: [],
      trimLabel: true,
      type: 'activity',
    };

    bands.push(activityBand);
  });

  return bands;
}

/**
 * Returns a list of new composite bands.
 */
export function toCompositeBand(
  subBand: RavenSubBand,
  containerId?: string,
  sortOrder?: number,
): RavenCompositeBand {
  const compositeBandUniqueId = uniqueId();

  const compositeBand: RavenCompositeBand = {
    compositeAutoScale: true,
    compositeLogTicks: false,
    compositeScientificNotation: false,
    compositeYAxisLabel: false,
    containerId: containerId || '0',
    height: subBand.height,
    heightPadding: subBand.heightPadding,
    id: compositeBandUniqueId,
    name: subBand.name,
    overlay: false, // Composite bands with a single sub-band cannot be overlay by default.
    showTooltip: subBand.showTooltip,
    sortOrder: sortOrder || 0,
    subBands: [{
      ...subBand,
    }],
    type: 'composite',
  };

  return compositeBand;
}

/**
 * Returns a default divider band.
 */
export function toDividerBand(): RavenDividerBand {
  const id = uniqueId();

  const dividerBand: RavenDividerBand = {
    addTo: false,
    color: [255, 255, 255],
    height: 7,
    heightPadding: 10,
    id,
    label: `Divider ${id}`,
    labelColor: [0, 0, 0],
    maxTimeRange: { start: 0, end: 0 },
    name: `Divider ${id}`,
    parentUniqueId: null,
    points: [],
    showTooltip: true,
    sourceIds: [],
    tableColumns: [],
    type: 'divider',
  };

  return dividerBand;
}

/**
 * Returns a resource band given metadata and timelineData.
 */
export function toResourceBand(
  sourceId: string,
  metadata: MpsServerResourceMetadata,
  timelineData: MpsServerResourcePoint[],
  defaultBandSettings: RavenDefaultBandSettings,
  treeBySourceId: StringTMap<RavenSource>,
): RavenResourceBand {
  const { maxTimeRange, points } = getResourcePoints(sourceId, metadata, timelineData);

  const resourceBand: RavenResourceBand = {
    addTo: false,
    autoScale: true,
    color: defaultBandSettings.resourceColor,
    decimate: metadata.decimatedData,
    fill: false,
    fillColor: defaultBandSettings.resourceFillColor,
    height: 100,
    heightPadding: 10,
    icon: defaultBandSettings.icon,
    id: uniqueId(),
    interpolation: 'linear',
    isDuration: metadata.hasValueType.toLowerCase() === 'duration',
    isTime: metadata.hasValueType.toLowerCase() === 'time',
    label: metadata.hasObjectName,
    labelColor: '#000000',
    labelFont: defaultBandSettings.labelFont,
    labelPin: '',
    labelUnit: metadata.hasUnits || '',
    logTicks: false,
    maxTimeRange,
    name: metadata.hasObjectName,
    parentUniqueId: null,
    points,
    scientificNotation: false,
    showIcon: false,
    showLabelPin: true,
    showLabelUnit: true,
    showTooltip: true,
    sourceIds: [sourceId],
    tableColumns: [],
    type: 'resource',
  };

  return resourceBand;
}

/**
 * Returns a state band given metadata and timelineData.
 */
export function toStateBand(
  sourceId: string,
  metadata: MpsServerStateMetadata,
  timelineData: MpsServerStatePoint[],
  defaultBandSettings: RavenDefaultBandSettings,
  treeBySourceId: StringTMap<RavenSource>,
): RavenStateBand {
  const { maxTimeRange, points } = getStatePoints(sourceId, timelineData);

  const stateBand: RavenStateBand = {
    addTo: false,
    alignLabel: 3,
    baselineLabel: 3,
    borderWidth: 1,
    height: 50,
    heightPadding: 0,
    id: uniqueId(),
    label: metadata.hasObjectName,
    labelColor: [0, 0, 0],
    labelFont: defaultBandSettings.labelFont,
    labelPin: '',
    maxTimeRange,
    name: metadata.hasObjectName,
    parentUniqueId: null,
    points,
    showLabelPin: true,
    showStateChangeTimes: false,
    showTooltip: true,
    sourceIds: [sourceId],
    tableColumns: [],
    type: 'state',
  };

  return stateBand;
}

/**
 * Helper. Updates the sortOrder for the given bands within each containerId.
 * Does not change the displayed sort order, only shifts the indices so they count up from 0.
 * When we remove bands, this is good at making sure the sortOrder is always maintained.
 *
 * For example if the following bands array is given (other non-necessary band props excluded):
 *
 * let bands = [
 *    { containerId: '0', sortOrder: 100 },
 *    { containerId: '1', sortOrder: 20 },
 *    { containerId: '0', sortOrder: 10 },
 *    { containerId: '1', sortOrder: 10 },
 * ];
 *
 * First we do a sortBy containerId and sortOrder which gives:
 *
 * bands === [
 *    { containerId: '0', sortOrder: 10 },
 *    { containerId: '0', sortOrder: 100 },
 *    { containerId: '1', sortOrder: 10 },
 *    { containerId: '1', sortOrder: 20 },
 * ];
 *
 * Then we reset the sortOrder for each given containerId to start at 0:
 *
 * bands === [
 *    { containerId: '0', sortOrder: 0 },
 *    { containerId: '0', sortOrder: 1 },
 *    { containerId: '1', sortOrder: 0 },
 *    { containerId: '1', sortOrder: 1 },
 * ];
 */
export function updateSortOrder(bands: RavenCompositeBand[]): RavenCompositeBand[] {
  const sortByBands = sortBy(bands, 'containerId', 'sortOrder');
  const index = {}; // Hash of containerIds to a given index (indices start at 0).

  return sortByBands.map((band: RavenCompositeBand) => {
    if (index[band.containerId] === undefined) {
      index[band.containerId] = 0;
    } else {
      index[band.containerId]++;
    }

    return {
      ...band,
      sortOrder: index[band.containerId],
    };
  });
}

/**
 * Helper that gets new time ranges based on the current view time range and the list of given bands.
 */
export function updateTimeRanges(bands: RavenCompositeBand[], currentViewTimeRange: RavenTimeRange) {
  let maxTimeRange: RavenTimeRange = { end: 0, start: 0 };
  let viewTimeRange: RavenTimeRange = { end: 0, start: 0 };

  if (bands.length > 0) {
    let endTime = Number.MIN_SAFE_INTEGER;
    let startTime = Number.MAX_SAFE_INTEGER;

    // Calculate the maxTimeRange out of every band.
    for (let i = 0, l = bands.length; i < l; ++i) {
      const band = bands[i];

      for (let j = 0, ll = band.subBands.length; j < ll; ++j) {
        const subBand = band.subBands[j];

        // Since dividers don't really have a time range, make sure we do not re-calc time for them.
        // Also make sure we dont account for 0's in maxTimeRange (e.g. when loading layouts).
        if (subBand.type !== 'divider') {
          if (subBand.maxTimeRange.start !== 0 && subBand.maxTimeRange.start < startTime) {
            startTime = subBand.maxTimeRange.start;
          }
          if (subBand.maxTimeRange.end !== 0 && subBand.maxTimeRange.end > endTime) {
            endTime = subBand.maxTimeRange.end;
          }
        }
      }
    }

    maxTimeRange = { end: endTime, start: startTime };
    viewTimeRange = { ...currentViewTimeRange };

    // Re-set viewTimeRange to maxTimeRange if both start and end are 0 (e.g. they have never been set),
    // or they are MIN/MAX values (e.g. if we only have dividers on screen).
    if (viewTimeRange.start === 0 && viewTimeRange.end === 0 ||
        viewTimeRange.start === Number.MAX_SAFE_INTEGER && viewTimeRange.end === Number.MIN_SAFE_INTEGER) {
      viewTimeRange = { ...maxTimeRange };
    }
  }

  return {
    maxTimeRange,
    viewTimeRange,
  };
}

/**
 * Helper. Updates the selectedBandId and selectedSubBandId based on the current band list.
 */
export function updateSelectedBandIds(
  bands: RavenCompositeBand[],
  selectedBandId: string,
  selectedSubBandId: string,
) {
  const band = bandById(bands, selectedBandId) as RavenCompositeBand;
  const subBand = subBandById(bands, selectedBandId, selectedSubBandId);

  if (!band) {
    selectedBandId = '';
    selectedSubBandId = '';
  } else if (!subBand) {
    selectedSubBandId = band.subBands[0].id;
  }

  return {
    selectedBandId,
    selectedSubBandId,
  };
}

/**
 * Helper returns band label with composed label and unit if they exist.
 * Note the typing on `subBand` is cast to `RavenResourceBand` since the `RavenResourceBand` has the all the required properties.
 * This should not be a problem since we are checking `subBand.(...)` before accessing any properties.
 */
export function getBandLabel(band: RavenSubBand): string {
  const subBand = band as RavenResourceBand;
  let labelPin = '';
  let labelUnit = '';

  if (subBand.showLabelPin && subBand.labelPin !== '') {
    labelPin = ` (${subBand.labelPin})`;
  }

  if (subBand.showLabelUnit && subBand.labelUnit !== '') {
    labelUnit = ` (${subBand.labelUnit})`;
  }

  return subBand.type === 'resource' ? `${subBand.label}${labelPin}${labelUnit}` : `${subBand.label}${labelPin}`;
}

/**
 * Helper. Get customFilters from sourceIds in bands. e.g ../command?label=ips&filter=.*IPS.*
 */
export function getCustomFiltersBySourceId(
  bands: RavenCompositeBand[],
  treeBySourceId: StringTMap<RavenSource>,
) {
  const customFiltersBySourceId = {};

  bands.forEach((band: RavenCompositeBand) => {
    band.subBands.forEach((subBand: RavenSubBand) => {
      subBand.sourceIds.forEach(sourceId => {
        const hasQueryString = sourceId.match(new RegExp('(.*)\\?(.*)'));

        if (hasQueryString) {
          const [, id, args] = hasQueryString;
          const source = treeBySourceId[id];

          if (source && source.type === 'customGraphable') {
            const hasQueryStringArgs = args.match(new RegExp('(.*)=(.*)&(.*)=(.*)'));

            if (hasQueryStringArgs) {
              // Name/Value pairs here are parsed from the query string: ?name1=value1&name2=value2.
              const [, name1, value1, name2, value2] = hasQueryStringArgs;

              const customFilter = {
                [name1]: value1,
                [name2]: value2,
              };

              const customFilters = customFiltersBySourceId[id] || [];
              customFiltersBySourceId[id] = customFilters.concat(customFilter);
            }
          }
        }
      });
    });
  });

  return customFiltersBySourceId;
}

/**
 * Helper returns the filter for a customGraphableSource label.
 */
export function getFilterLabel(customGraphableSource: RavenCustomGraphableSource, customFilter: RavenCustomFilter) {
  if (customGraphableSource.arg === 'filter') {
    return `(${customGraphableSource.filterKey}=[${customFilter.filter}])`;
  } else {
    return `${customGraphableSource.arg}=${customFilter.filter}`;
  }
}

/**
 * Helper. Returns an activity-by-type band locator if a given band exists in the list of bands for a legend.
 * `null` otherwise.
 */
export function hasActivityBand(bands: RavenCompositeBand[], band: RavenSubBand, pinLabel: string) {
  if (band.type === 'activity') {
    for (let i = 0, l = bands.length; i < l; ++i) {
      for (let j = 0, ll = bands[i].subBands.length; j < ll; ++j) {
        const subBand = bands[i].subBands[j] as RavenActivityBand;
        if (
          subBand.type === 'activity' &&
          subBand.label === (band as RavenActivityBand).legend &&
          subBand.labelPin === pinLabel) {
          return {
            bandId: bands[i].id,
            subBandId: subBand.id,
          };
        }
      }
    }
  }
  return null;
}

/**
 * Helper. Returns an activity band for a filterTarget.
 * `null` otherwise.
 */
export function hasActivityBandForFilterTarget(bands: RavenCompositeBand[], filterTarget: string) {
  for (let i = 0, l = bands.length; i < l; ++i) {
    for (let j = 0, ll = bands[i].subBands.length; j < ll; ++j) {
      const subBand = bands[i].subBands[j] as RavenActivityBand;
      if (
        subBand.type === 'activity' &&
        subBand.filterTarget === filterTarget
      ) {
        return {
          bandId: bands[i].id,
          subBandId: subBand.id,
        };
      }
    }
  }
  return null;
}

/**
 * Helper. Returns a sub-band locator if a given band has a source id.
 * `null` otherwise.
 */
export function hasSourceId(bands: RavenCompositeBand[], sourceId: string) {
  for (let i = 0, l = bands.length; i < l; ++i) {
    for (let j = 0, ll = bands[i].subBands.length; j < ll; ++j) {
      const subBand = bands[i].subBands[j];

      if (subBand.sourceIds.includes(sourceId)) {
        return {
          bandId: bands[i].id,
          subBandId: subBand.id,
        };
      }
    }
  }
  return null;
}

/**
 * Helper. Returns a band from a list of bands with the given id. Null otherwise.
 */
export function bandById(bands: RavenSubBand[] | RavenCompositeBand[], id: string): RavenSubBand | RavenCompositeBand | null {
  for (let i = 0, l = bands.length; i < l; ++i) {
    if (bands[i].id === id) {
      return bands[i];
    }
  }
  return null;
}

/**
 * Helper. Returns a sub-band from a list of bands with the given id. Null otherwise.
 */
export function subBandById(bands: RavenCompositeBand[], bandId: string, subBandId: string): RavenSubBand | null {
  for (let i = 0, l = bands.length; i < l; ++i) {
    if (bands[i].id === bandId) {
      for (let j = 0, ll = bands[i].subBands.length; j < ll; ++j) {
        if (bands[i].subBands[j].id === subBandId) {
          return bands[i].subBands[j];
        }
      }
    }
  }
  return null;
}

/**
 * Helper. Returns true if the given sub-band id in a list of bands is in add-to mode. False otherwise.
 */
export function isAddTo(bands: RavenCompositeBand[], bandId: string, subBandId: string, type: string): boolean {
  const subBand = subBandById(bands, bandId, subBandId);

  if (subBand && subBand.type === type) {
    return subBand.addTo;
  }

  return false;
}

/**
 * Helper. Returns true if an activity is a `message` type. False otherwise.
 */
export function isMessageTypeActivity(activity: RavenActivityPoint): boolean {
  return activity.message && !activity.keywordLine ? true : false;
}

/**
 * Helper. Returns true if the given band id in a list of bands is in overlay mode. False otherwise.
 */
export function isOverlay(bands: RavenCompositeBand[], bandId: string): boolean {
  const band = bandById(bands, bandId) as RavenCompositeBand;

  if (band) {
    return band.overlay;
  }

  return false;
}

/**
 * Returns a new time range based on the view time range and some delta.
 */
export function changeZoom(
  delta: number,
  viewTimeRange: RavenTimeRange,
): RavenTimeRange {
  const { end, start } = viewTimeRange;
  const range = end - start;
  const zoomAmount = range / delta;

  return {
    end: end - zoomAmount,
    start: start + zoomAmount,
  };
}
