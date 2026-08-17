export namespace domain {
	
	export class HistoryRecord {
	    id: string;
	    type: string;
	    format: string;
	    timezone: string;
	    createdAt: number;
	    input: Record<string, string>;
	    output: Record<string, string>;
	
	    static createFrom(source: any = {}) {
	        return new HistoryRecord(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.type = source["type"];
	        this.format = source["format"];
	        this.timezone = source["timezone"];
	        this.createdAt = source["createdAt"];
	        this.input = source["input"];
	        this.output = source["output"];
	    }
	}
	export class ToolHistoryRecord {
	    id: string;
	    toolId: string;
	    action: string;
	    createdAt: number;
	    input: Record<string, string>;
	    output: Record<string, string>;
	
	    static createFrom(source: any = {}) {
	        return new ToolHistoryRecord(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.toolId = source["toolId"];
	        this.action = source["action"];
	        this.createdAt = source["createdAt"];
	        this.input = source["input"];
	        this.output = source["output"];
	    }
	}

}

