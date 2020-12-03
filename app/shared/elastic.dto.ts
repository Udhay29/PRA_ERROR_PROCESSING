

export interface ElasticHit<T> {
  _index: string;
  _type: string;
  _id: string;
  _score: number;
  _source: T;
}

export interface ElasticHitsContainer<T> {
  total: number;
  max_score: number;
  hits: ElasticHit<T>[];
}

export interface ElasticResult<T> {
  took: number;
  timed_out: boolean;
  _shards: any;
  hits: ElasticHitsContainer<T>;
}
