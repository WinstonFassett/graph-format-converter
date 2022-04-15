import { IGraphAttribute } from "../Interfaces";
/**
 * The GraphFormatConverter class
 */
export declare class GraphFormatConverter {
    private nodes;
    private edges;
    private nodeAttributes;
    private edgeAttributes;
    private graphAttributes;
    /**
     * The constructor of the graph
     * @param nodes The nodes of the graph
     * @param edges The edges of the graph
     * @param nodeAttributes The attributes a node can take
     * @param edgeAttributes The attributes an edge can take
     * @param graphAttributes The attributes of a graph
     * @private
     */
    private constructor();
    /**
     * The options of the parser
     */
    private static parserOptions;
    /**
     * The options of the builder
     */
    private static builderOptions;
    /**
     * Create a graph from a JSON set of nodes and edges
     * @param graphData The data of the graph as JSON
     * @return GraphFormatConverter The Graph from the JSON graph data
     */
    static fromJson: (graphData: {
        nodes: any[];
        edges: any[];
        attributes: IGraphAttribute;
    }) => GraphFormatConverter;
    /**
     * Create a graph
     * @param graphData
     * @return GraphFormatConverter The Graph from the Graphology JSON graph data
     */
    static fromGraphology: (graphData: {
        nodes: any[];
        edges: any[];
        attributes: IGraphAttribute;
    }) => GraphFormatConverter;
    /**
     * Create a graph from a GEXF string
     * @param graphData The data of the graph as GEXF
     * @return GraphFormatConverter The Graph from the GEXF graph data
     */
    static fromGexf: (graphData: string) => GraphFormatConverter;
    /**
     * Create a graph from a Graphml string
     * @param graphData The data of the graph as Graphml
     * @return GraphFormatConverter The Graph from the Graphml graph data
     */
    static fromGraphml: (graphData: string) => GraphFormatConverter;
    /**
     * Get the JSON format of the graph
     * @return {nodes: any[], edges: any[]} The graph a JSON Object
     */
    toJson: () => {
        nodes: any[];
        edges: any[];
        attributes: IGraphAttribute;
    };
    /**
     * Get the JSON Graphology format of the graph
     * @return {nodes: any[], edges: any[], attributes: any[]} The graph a JSON Object
     */
    toGraphology: () => {
        nodes: any[];
        edges: any[];
        attributes: any;
    };
    /**
     * Get the GEXF format of the graph
     * @return string The graph a GEXF string Object
     */
    toGexf: () => string;
    /**
     * Get the Graphml format of the graph
     * @return string The graph a Graphml string Object
     */
    toGraphml: () => string;
    /**
 * Get the Graphml format of the graph
     * @return string The graph a Graphml string Object
     */
    toYedGraphml: () => string;
    /**
     * Get an element as a GRAPHML 'fast-xml-parser' JSON object
     * @param element The element
     */
    private static getElementAsGraphmlJSON;
    /**
     * Get an element as a GRAPHML 'fast-xml-parser' JSON object
     * @param element The element
     */
    private static getElementAsYedGraphmlJSON;
    /**
     * Get an element as a GEXF 'fast-xml-parser' JSON object
     * @param element The element
     */
    private static getElementAsGexfJSON;
    /**
     * Get the JSON type of a GEXF type
     * @param type The GEXF type
     */
    private static gexfTypeToJSON;
    /**
     * Get the GEXF type of a JSON type
     * @param type The JSON type
     */
    private static jsonTypeToGEXF;
    /**
     * Get the JSON type of a GRAPHML type
     * @param type The GRAPHML type
     */
    private static graphmlTypeToJSON;
    /**
     * Get the GRAPHML type of a JSON type
     * @param type The JSON type
     */
    private static jsonTypeToGRAPHML;
    /**
     * Get the type possibilities of a attribute
     * @param key The key of the attribute
     * @param value The value of the attribute to try to guess the type of
     * @param attributesObject The attribute object contain the attributes and their type's count
     */
    private static guessJSONAttribute;
    /**
     * Get the attributes of the nodes/edges from the attributesObject gathered by the function 'guessJSONAttribute'
     * @param attributesObject The attributes object
     */
    private static getAttributesFromGuesser;
    /**
     * Get the attributes as a array of objects
     * @param attributes The attributes
     */
    private static getAttributesDefinitionAsObject;
    /**
     * Get the attributes (as well as nested attributes of an element) from a GEXF element
     * @param element The element to gather the attributes of
     */
    private static getGexfElementAttributes;
    /**
     * Get the attributes (as well as nested attributes of an element) from a Graphml element
     * @param element The element to gather the attributes of
     */
    private static getGraphmlElementAttributes;
    /**
     * Get the nodes of the graph on a JSON format
     * @return any[] The nodes of the graph
     */
    getNodes: () => any[];
    /**
     * Get the edges of the graph on a JSON format
     * @return any[] The edges of the graph
     */
    getEdges: () => any[];
    /**
     * Get the attributes of the graph on a JSON format
     * @return any[] The attributes of the graph
     */
    getAttributes: () => IGraphAttribute;
}
