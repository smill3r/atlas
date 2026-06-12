import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { Observable, map, shareReplay } from 'rxjs';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { Topology } from 'topojson-specification';

/** A country shape ready to render: a numeric ISO id + an SVG path string. */
export interface CountryShape {
  numericId: string; // zero-padded ISO 3166-1 numeric, matches countries.json
  name: string;
  d: string;
}

/** A country's raw geometry, kept so the globe can re-project on rotation. */
export interface CountryFeature {
  numericId: string;
  name: string;
  feature: Feature<Geometry>;
}

export const MAP_WIDTH = 1000;
export const MAP_HEIGHT = 500;

@Injectable({ providedIn: 'root' })
export class MapProjectionService {
  private readonly http = inject(HttpClient);

  private features$?: Observable<CountryFeature[]>;
  private shapes$?: Observable<CountryShape[]>;

  /** Load + parse world-atlas TopoJSON into per-country GeoJSON features (once). */
  getCountryFeatures(): Observable<CountryFeature[]> {
    return (this.features$ ??= this.http
      .get<Topology>('assets/topojson/countries-110m.json')
      .pipe(
        map((topology) => this.toFeatures(topology)),
        shareReplay(1),
      ));
  }

  /** Flat (Natural Earth) projection -> SVG path strings, computed once. */
  getCountryShapes(): Observable<CountryShape[]> {
    return (this.shapes$ ??= this.getCountryFeatures().pipe(
      map((features) => this.flatProject(features)),
      shareReplay(1),
    ));
  }

  private toFeatures(topology: Topology): CountryFeature[] {
    const collection = feature(
      topology,
      topology.objects['countries']!,
    ) as unknown as FeatureCollection<Geometry, { name?: string }>;

    const out: CountryFeature[] = [];
    for (const f of collection.features) {
      if (f.id == null) continue;
      out.push({
        numericId: String(f.id).padStart(3, '0'),
        name: f.properties?.name ?? '',
        feature: f,
      });
    }
    return out;
  }

  private flatProject(features: CountryFeature[]): CountryShape[] {
    const collection: FeatureCollection<Geometry> = {
      type: 'FeatureCollection',
      features: features.map((f) => f.feature),
    };
    const projection = geoNaturalEarth1().fitSize([MAP_WIDTH, MAP_HEIGHT], collection);
    const path = geoPath(projection);

    const shapes: CountryShape[] = [];
    for (const f of features) {
      const d = path(f.feature);
      if (!d) continue;
      shapes.push({ numericId: f.numericId, name: f.name, d });
    }
    return shapes;
  }
}
