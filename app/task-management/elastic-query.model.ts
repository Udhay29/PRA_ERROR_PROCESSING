export interface ElasticQuery {
    query: ElasticQueryObject;
    _source: string[];
    from?: number;
    size?: number;
    sort?: any[];
}

export interface ElasticQueryObject {
    match_all?: any;
    bool?: BooleanQuery;
    match?: any;
}

export interface BooleanQuery {
    must?: any | any[];
    must_not?: any | any[];
    filter?: any | any[];
    should?: any | any[];
}
