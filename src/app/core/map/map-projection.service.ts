import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { Observable, map, shareReplay } from 'rxjs';
import { feature } from 'topojson-client';
import type { FeatureCollection, Geometry } from 'geojson';
import type { Topology } from 'topojson-specification';

/** A country shape ready to render: a numeric ISO id + an SVG path string. */
export interface CountryShape {
  numericId: string; // zero-padded ISO 3166-1 numeric, matches countries.json
  name: string;
  d: string;
}

export const MAP_WIDTH = 1000;
export const MAP_HEIGHT = 500;

@Injectable({ providedIn: 'root' })
export class MapProjectionService {
  private readonly http = inject(HttpClient);

  private shapes$?: Observable<CountryShape[]>;

  /** Load world-atlas TopoJSON and project it to SVG path strings (math only). */
  getCountryShapes(): Observable<CountryShape[]> {
    return (this.shapes$ ??= this.http
      .get<Topology>('assets/topojson/countries-110m.json')
      .pipe(
        map((topology) => this.project(topology)),
        shareReplay(1),
      ));
  }

  private project(topology: Topology): CountryShape[] {
    const collection = feature(
      topology,
      topology.objects['countries']!,
    ) as unknown as FeatureCollection<Geometry, { name?: string }>;

    const projection = geoNaturalEarth1().fitSize(
      [MAP_WIDTH, MAP_HEIGHT],
      collection,
    );
    const path = geoPath(projection);

    const shapes: CountryShape[] = [];
    for (const f of collection.features) {
      const d = path(f);
      if (!d || f.id == null) continue;
      shapes.push({
        numericId: String(f.id).padStart(3, '0'),
        name: f.properties?.name ?? '',
        d,
      });
    }
    return shapes;
  }
}
