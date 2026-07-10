import { CanonicalActivity, CanonicalStream, CanonicalLap } from './canonical/types';

/**
 * Calculates the Haversine distance between two points on the Earth (in meters).
 */
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Parses a standard GPX XML string into canonical structures.
 */
export function parseGpx(gpxText: string, userId: string, fileName: string): {
  activity: CanonicalActivity;
  stream: CanonicalStream;
} {
  const parser = new DOMParser();
  const xml = parser.parseFromString(gpxText, 'text/xml');
  
  const trkpts = xml.getElementsByTagName('trkpt');
  const metadataTime = xml.getElementsByTagName('time')[0]?.textContent;
  
  const latLngs: [number, number][] = [];
  const times: number[] = [];
  const elevations: number[] = [];
  const heartRates: number[] = [];
  
  let totalDistance = 0;
  let prevLat: number | null = null;
  let prevLon: number | null = null;
  
  const startTimeStr = trkpts[0]?.getElementsByTagName('time')[0]?.textContent || metadataTime || new Date().toISOString();
  const startTime = new Date(startTimeStr).getTime();
  
  for (let i = 0; i < trkpts.length; i++) {
    const pt = trkpts[i];
    const lat = parseFloat(pt.getAttribute('lat') || '0');
    const lon = parseFloat(pt.getAttribute('lon') || '0');
    const eleNode = pt.getElementsByTagName('ele')[0];
    const ele = eleNode ? parseFloat(eleNode.textContent || '0') : 0;
    
    const timeNode = pt.getElementsByTagName('time')[0];
    const ptTimeStr = timeNode ? timeNode.textContent : null;
    const ptTime = ptTimeStr ? new Date(ptTimeStr).getTime() : startTime + i * 1000;
    
    // Extract heart rate from Garmin extensions if present
    let hr = 0;
    const hrNode = pt.getElementsByTagName('gpxtpx:hr')[0] || pt.getElementsByTagName('hr')[0];
    if (hrNode) {
      hr = parseInt(hrNode.textContent || '0', 10);
    }
    
    latLngs.push([lat, lon]);
    times.push(Math.round((ptTime - startTime) / 1000));
    elevations.push(ele);
    if (hr > 0) heartRates.push(hr);
    
    if (prevLat !== null && prevLon !== null) {
      totalDistance += haversineDistance(prevLat, prevLon, lat, lon);
    }
    prevLat = lat;
    prevLon = lon;
  }
  
  const totalDuration = times.length > 0 ? times[times.length - 1] : 0;
  const avgHr = heartRates.length > 0 ? Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length) : undefined;
  
  const activityId = `gpx_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  
  const activity: CanonicalActivity = {
    id: activityId,
    athleteId: userId,
    externalId: `upload_${activityId}`,
    externalProviderId: 'gpx-upload',
    name: fileName.replace(/\.[^/.]+$/, "") || 'GPX Run Track',
    type: 'Run',
    startDate: startTimeStr,
    startDateLocal: startTimeStr,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    utcOffset: -new Date().getTimezoneOffset() * 60,
    distance: totalDistance,
    movingTime: totalDuration,
    elapsedTime: totalDuration,
    totalElevationGain: elevations.length > 1 ? Math.max(0, elevations[elevations.length - 1] - elevations[0]) : 0,
    averageSpeed: totalDuration > 0 ? totalDistance / totalDuration : 0,
    maxSpeed: totalDuration > 0 ? (totalDistance / totalDuration) * 1.5 : 0,
    averageHeartRate: avgHr,
    maxHeartRate: heartRates.length > 0 ? Math.max(...heartRates) : undefined,
    calories: Math.round((totalDistance / 1000) * 65), // approximate running calories
    devicePreference: 'gpx_uploader',
    sourceMetadata: {
      ingestedAt: new Date().toISOString(),
      rawPayloadHash: `gpx_hash_${Date.now()}`,
      providerApiVersion: 'gpx_v1',
      validationSignature: 'sha256_placeholder'
    }
  };
  
  const stream: CanonicalStream = {
    activityId,
    streamTypes: ['time', 'latlng', 'altitude', ...(heartRates.length > 0 ? ['heartrate'] : [])],
    length: times.length,
    time: times,
    latlng: latLngs,
    altitude: elevations,
    heartrate: heartRates.length > 0 ? heartRates : undefined,
  };
  
  return { activity, stream };
}

/**
 * Parses a standard TCX XML string into canonical structures.
 */
export function parseTcx(tcxText: string, userId: string, fileName: string): {
  activity: CanonicalActivity;
  stream: CanonicalStream;
} {
  const parser = new DOMParser();
  const xml = parser.parseFromString(tcxText, 'text/xml');
  
  const trackpoints = xml.getElementsByTagName('Trackpoint');
  
  const latLngs: [number, number][] = [];
  const times: number[] = [];
  const elevations: number[] = [];
  const heartRates: number[] = [];
  const distances: number[] = [];
  
  let startTimeStr = xml.getElementsByTagName('Id')[0]?.textContent || new Date().toISOString();
  let startTime = new Date(startTimeStr).getTime();
  
  for (let i = 0; i < trackpoints.length; i++) {
    const pt = trackpoints[i];
    
    const latNode = pt.getElementsByTagName('LatitudeDegrees')[0];
    const lonNode = pt.getElementsByTagName('LongitudeDegrees')[0];
    const lat = latNode ? parseFloat(latNode.textContent || '0') : 0;
    const lon = lonNode ? parseFloat(lonNode.textContent || '0') : 0;
    
    const eleNode = pt.getElementsByTagName('AltitudeMeters')[0];
    const ele = eleNode ? parseFloat(eleNode.textContent || '0') : 0;
    
    const timeNode = pt.getElementsByTagName('Time')[0];
    const ptTimeStr = timeNode ? timeNode.textContent : null;
    const ptTime = ptTimeStr ? new Date(ptTimeStr).getTime() : startTime + i * 1000;
    
    const hrNode = pt.getElementsByTagName('HeartRateBpm')[0]?.getElementsByTagName('Value')[0];
    const hr = hrNode ? parseInt(hrNode.textContent || '0', 10) : 0;
    
    const distNode = pt.getElementsByTagName('DistanceMeters')[0];
    const dist = distNode ? parseFloat(distNode.textContent || '0') : 0;
    
    latLngs.push([lat, lon]);
    times.push(Math.round((ptTime - startTime) / 1000));
    elevations.push(ele);
    distances.push(dist);
    if (hr > 0) heartRates.push(hr);
  }
  
  const totalDistance = distances.length > 0 ? distances[distances.length - 1] : 0;
  const totalDuration = times.length > 0 ? times[times.length - 1] : 0;
  const avgHr = heartRates.length > 0 ? Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length) : undefined;
  
  const activityId = `tcx_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  
  const activity: CanonicalActivity = {
    id: activityId,
    athleteId: userId,
    externalId: `upload_${activityId}`,
    externalProviderId: 'tcx-upload',
    name: fileName.replace(/\.[^/.]+$/, "") || 'TCX Run Training',
    type: 'Run',
    startDate: startTimeStr,
    startDateLocal: startTimeStr,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    utcOffset: -new Date().getTimezoneOffset() * 60,
    distance: totalDistance,
    movingTime: totalDuration,
    elapsedTime: totalDuration,
    totalElevationGain: elevations.length > 1 ? Math.max(0, elevations[elevations.length - 1] - elevations[0]) : 0,
    averageSpeed: totalDuration > 0 ? totalDistance / totalDuration : 0,
    maxSpeed: totalDuration > 0 ? (totalDistance / totalDuration) * 1.5 : 0,
    averageHeartRate: avgHr,
    maxHeartRate: heartRates.length > 0 ? Math.max(...heartRates) : undefined,
    calories: Math.round((totalDistance / 1000) * 65),
    devicePreference: 'tcx_uploader',
    sourceMetadata: {
      ingestedAt: new Date().toISOString(),
      rawPayloadHash: `tcx_hash_${Date.now()}`,
      providerApiVersion: 'tcx_v1',
      validationSignature: 'sha256_placeholder'
    }
  };
  
  const stream: CanonicalStream = {
    activityId,
    streamTypes: ['time', 'latlng', 'altitude', 'distance', ...(heartRates.length > 0 ? ['heartrate'] : [])],
    length: times.length,
    time: times,
    latlng: latLngs,
    altitude: elevations,
    distance: distances,
    heartrate: heartRates.length > 0 ? heartRates : undefined,
  };
  
  return { activity, stream };
}
