import {XMLBuilder, XMLParser} from "fast-xml-parser";
import {IAttribute, IEdgeAttribute, IGraphAttribute, INodeAttribute} from "../Interfaces";
import tinycolor2 from "tinycolor2";
import {AttributeType} from "../Types";

/**
 * The GraphFormatConverter class
 */
export class GraphFormatConverter {

    /**
     * The constructor of the graph
     * @param nodes The nodes of the graph
     * @param edges The edges of the graph
     * @param nodeAttributes The attributes a node can take
     * @param edgeAttributes The attributes an edge can take
     * @param graphAttributes The attributes of a graph
     * @private
     */
    private constructor(private nodes: any[] = [], private edges: any[] = [], private nodeAttributes: INodeAttribute[] = [], private edgeAttributes: IEdgeAttribute[] = [], private graphAttributes: IGraphAttribute = {
        id: "graph",
        edgeType: "undirected",
        mode: "static"
    }) {}

    /**
     * The options of the parser and the builder
     */
    private static options = {
        ignoreAttributes: false,
        attributeNamePrefix: "@_@_@_",
        allowBooleanAttributes: true,
        removeNSPrefix: true,
        parseAttributeValue: true,
        format: true
    };

    /**
     * Create a graph from a JSON set of nodes and edges
     * @param graphData The data of the graph as JSON
     * @return GraphFormatConverter The Graph from the JSON graph data
     */
    public static fromJson = (graphData: { nodes: any[], edges: any[] }): GraphFormatConverter => {

        // The objects that will contain the attributes of the nodes and edges
        const nodeAttributesObject: any = {};
        const edgeAttributesObject: any = {};

        /**
         * Function to reorganize the attributes of an element and function used to get the attributes of the nodes/edges
         */
        const reorganizeAttributesOfElements = (elements: any[], isNode: boolean) => {
            return elements.map((element) => {

                // If there is no attributes we add an empty object
                if (element.attributes === undefined) {
                    element.attributes = {};
                }

                // Else we need to keep use this attribute to guess the type of the element attribute
                else {
                    Object.entries(element.attributes).forEach(([key, value]) => {
                        GraphFormatConverter.guessJSONAttribute(key, value, isNode ? nodeAttributesObject : edgeAttributesObject);
                    });
                }

                // If the color is set, we keep it as a tinycolor2 color
                if (element.color !== undefined) {
                    element.color = tinycolor2(element.color);
                }

                // We need to rearrange the attributes of the element and put them in the element.attributes object
                for (const elementKey in element) {

                    // We have some keys we do not want to bother with
                    if (elementKey !== "attributes" && elementKey !== "color" && elementKey !== "id" && elementKey !== "source" && elementKey !== "target") {
                        GraphFormatConverter.guessJSONAttribute(elementKey, element[elementKey], isNode ? nodeAttributesObject : edgeAttributesObject);
                    }

                    // There are some key that should not be in the attributes object
                    if (elementKey !== "attributes" && elementKey !== "color" && elementKey !== "id" && elementKey !== "size" && elementKey !== "weight" && elementKey !== "target" && elementKey !== "source" && elementKey !== "label" && elementKey !== "edgelabel" && elementKey !== "shape" && elementKey !== "x" && elementKey !== "y" && elementKey !== "z") {
                        element.attributes[elementKey] = element[elementKey];
                        delete element[elementKey];
                    }
                }

                return element;
            });
        }

        // Rearrange the nodes and the edges
        graphData.nodes = reorganizeAttributesOfElements(graphData.nodes, true);
        graphData.edges = reorganizeAttributesOfElements(graphData.edges, false);

        // Now we can create the array of attributes
        const nodeAttributes: INodeAttribute[] = GraphFormatConverter.getAttributesFromGuesser(nodeAttributesObject);
        const edgeAttributes: IEdgeAttribute[] = GraphFormatConverter.getAttributesFromGuesser(edgeAttributesObject);

        // We set the most generic graph attributes possible
        const graphAttributes: IGraphAttribute = {
            id: "graph",
            edgeType: "undirected",
            mode: "static"
        };

        // Return the GraphFormatConverter
        return new GraphFormatConverter(graphData.nodes, graphData.edges, nodeAttributes, edgeAttributes, graphAttributes);
    }

    /**
     * Create a graph from a GEXF string
     * @param graphData The data of the graph as GEXF
     * @return GraphFormatConverter The Graph from the GEXF graph data
     */
    public static fromGexf = (graphData: string): GraphFormatConverter => {

        // We use a try/catch for the parser to know if the XML string is correct or not
        const parser = new XMLParser(GraphFormatConverter.options);
        let parsedResult;
        try {
            parsedResult = parser.parse(graphData);
        } catch (e) {
            throw new Error(`An error occurred while trying to parse the XML string: ${e}`);
        }

        // When the string is parsed we can work on it
        try {

            // First we want to gather the attributes
            let nodeAttributes: INodeAttribute[] = [];
            let edgeAttributes: IEdgeAttribute[] = [];
            if (parsedResult.gexf.graph.attributes !== undefined) {

                // If there is only one attribute we will get an object instead of an array of objects, thus we need to convert it to an array
                let attributesArray = parsedResult.gexf.graph.attributes;
                if (!Array.isArray(attributesArray)) {
                    attributesArray = [attributesArray];
                }

                // Get the nodes/edges attributes
                nodeAttributes = GraphFormatConverter.getAttributesDefinitionAsObject(attributesArray.find((attribute: any) => attribute[`${GraphFormatConverter.options.attributeNamePrefix}class`] === "node"));
                edgeAttributes = GraphFormatConverter.getAttributesDefinitionAsObject(attributesArray.find((attribute: any) => attribute[`${GraphFormatConverter.options.attributeNamePrefix}class`] === "edge"));
            }

            // Then we gather the graph attributes
            const graphAttributes: IGraphAttribute = {id: "graph", edgeType: "undirected", mode: "static"};

            // Try to get the id
            if (parsedResult.gexf.graph[`${GraphFormatConverter.options.attributeNamePrefix}id`] !== undefined) {
                graphAttributes.id = parsedResult.gexf.graph[`${GraphFormatConverter.options.attributeNamePrefix}id`];
            }

            // Try to get the edge type
            if (parsedResult.gexf.graph[`${GraphFormatConverter.options.attributeNamePrefix}defaultedgetype`] !== undefined) {
                graphAttributes.edgeType = parsedResult.gexf.graph[`${GraphFormatConverter.options.attributeNamePrefix}defaultedgetype`];
            }

            // Try to get the mode
            if (parsedResult.gexf.graph[`${GraphFormatConverter.options.attributeNamePrefix}mode`] !== undefined) {
                graphAttributes.id = parsedResult.gexf.graph[`${GraphFormatConverter.options.attributeNamePrefix}mode`];
            }

            // Then we want to gather the nodes
            const nodes: any[] = parsedResult.gexf.graph.nodes.node.map(GraphFormatConverter.getGexfElementAttributes);

            // Then we want to gather the edges
            const edges: any[] = parsedResult.gexf.graph.edges.edge.map(GraphFormatConverter.getGexfElementAttributes);

            // Return the GraphFormatConverter
            return new GraphFormatConverter(nodes, edges, nodeAttributes, edgeAttributes, graphAttributes);
        } catch (e) {
            throw new Error("An error has occurred while creating the graph, your file is malformed");
        }
    }

    /**
     * Create a graph from a Graphml string
     * @param graphData The data of the graph as Graphml
     * @return GraphFormatConverter The Graph from the Graphml graph data
     */
    public static fromGraphml = (graphData: string): GraphFormatConverter => {

        // We use a try/catch for the parser to know if the XML string is correct or not
        const parser = new XMLParser(GraphFormatConverter.options);
        let parsedResult;
        try {
            parsedResult = parser.parse(graphData);
        } catch (e) {
            throw new Error(`An error occurred while trying to parse the XML string: ${e}`);
        }

        try {

            // When the string is parsed we can work on it

            // First we want to gather the attributes
            const nodeAttributes: INodeAttribute[] = [];
            const edgeAttributes: IEdgeAttribute[] = [];
            if (parsedResult.graphml.key !== undefined) {

                // If the keys is an object we make it an array
                let keys = parsedResult.graphml.key;
                if (!Array.isArray(keys)) {
                    keys = [keys];
                }

                // For each key get the attributes for either the nodes or the edges
                keys.forEach((key: any) => {

                    // If the key is ID, source or target we do not keep it
                    if (key === "id" || key === "source" || key === "target") {
                        return;
                    }

                    // Create the attribute object
                    const attribute: IAttribute = {
                        id: key[`${GraphFormatConverter.options.attributeNamePrefix}id`],
                        type: GraphFormatConverter.graphmlTypeToJSON(key[`${GraphFormatConverter.options.attributeNamePrefix}attr.type`]),
                        title: key[`${GraphFormatConverter.options.attributeNamePrefix}attr.name`],
                    }

                    // If the attribute is about the nodes
                    if (key[`${GraphFormatConverter.options.attributeNamePrefix}for`] === "node") {
                        nodeAttributes.push(attribute);
                    }

                    // If the attribute is about the edges
                    else if (key[`${GraphFormatConverter.options.attributeNamePrefix}for`] === "edge") {
                        edgeAttributes.push(attribute);
                    }
                });
            }

            // Then we gather the graph attributes
            const graphAttributes: IGraphAttribute = {edgeType: "undirected", mode: "static", id: "graph"};

            // Get the id
            if (parsedResult.graphml.graph[`${GraphFormatConverter.options.attributeNamePrefix}id`] !== undefined) {
                graphAttributes.id = parsedResult.graphml.graph[`${GraphFormatConverter.options.attributeNamePrefix}id`];
            }

            // Get the edge type
            if (parsedResult.graphml.graph[`${GraphFormatConverter.options.attributeNamePrefix}edgedefault`] !== undefined) {
                graphAttributes.edgeType = parsedResult.graphml.graph[`${GraphFormatConverter.options.attributeNamePrefix}edgedefault`];
            }

            // Then we want to gather the nodes
            const nodes: any[] = parsedResult.graphml.graph.node.map(GraphFormatConverter.getGraphmlElementAttributes);

            // Then we want to gather the edges
            const edges: any[] = parsedResult.graphml.graph.edge.map(GraphFormatConverter.getGraphmlElementAttributes);

            // Return the GraphFormatConverter
            return new GraphFormatConverter(nodes, edges, nodeAttributes, edgeAttributes, graphAttributes);
        } catch (e) {
            throw new Error("An error has occurred while creating the graph, your file is malformed");
        }
    }

    /**
     * Get the JSON format of the graph
     * @return {nodes: any[], edges: any[]} The graph a JSON Object
     */
    public toJson = (): { nodes: any[], edges: any[] } => {
        return {
            nodes: this.nodes.map((node) => {
                if (node.color !== undefined) {
                    node.color = node.color.toRgbString();
                }
                return node;
            }),
            edges: this.edges.map((edge) => {
                if (edge.color !== undefined) {
                    edge.color = edge.color.toRgbString();
                }
                return edge;
            })
        }
    }

    /**
     * Get the GEXF format of the graph
     * @return string The graph a GEXF string Object
     */
    public toGexf = (): string => {

        // Get the nodes and the edges as formatted JSON
        const nodes: any[] = this.nodes.map(GraphFormatConverter.getElementAsGexfJSON);
        const edges: any[] = this.edges.map(GraphFormatConverter.getElementAsGexfJSON);

        // The attributes a node can take
        const nodeAttributes: any[] = this.nodeAttributes.map((attribute) => {
            return {
                [`${GraphFormatConverter.options.attributeNamePrefix}id`]: attribute.id,
                [`${GraphFormatConverter.options.attributeNamePrefix}title`]: attribute.title,
                [`${GraphFormatConverter.options.attributeNamePrefix}type`]: GraphFormatConverter.jsonTypeToGEXF(attribute.type),
            }
        });

        // The attributes an edge can take
        const edgeAttributes: any[] = this.edgeAttributes.map((attribute) => {
            return {
                [`${GraphFormatConverter.options.attributeNamePrefix}id`]: attribute.id,
                [`${GraphFormatConverter.options.attributeNamePrefix}title`]: attribute.title,
                [`${GraphFormatConverter.options.attributeNamePrefix}type`]: GraphFormatConverter.jsonTypeToGEXF(attribute.type),
            }
        });

        // The root object
        const root = {
            "?xml": {
                [`${GraphFormatConverter.options.attributeNamePrefix}version`]: "1.0",
                [`${GraphFormatConverter.options.attributeNamePrefix}encoding`]: "UTF-8",
            },
            "gexf": {
                "graph": {
                    attributes: [
                        {
                            attribute: nodeAttributes,
                            [`${GraphFormatConverter.options.attributeNamePrefix}class`]: "node",
                            [`${GraphFormatConverter.options.attributeNamePrefix}mode`]: "static",
                        },
                        {
                            attribute: edgeAttributes,
                            [`${GraphFormatConverter.options.attributeNamePrefix}class`]: "edge",
                            [`${GraphFormatConverter.options.attributeNamePrefix}mode`]: "static",
                        }
                    ],
                    nodes: {
                        node: nodes
                    },
                    edges: {
                        edge: edges
                    },
                    [`${GraphFormatConverter.options.attributeNamePrefix}id`]: this.graphAttributes.id,
                    [`${GraphFormatConverter.options.attributeNamePrefix}mode`]: this.graphAttributes.mode,
                    [`${GraphFormatConverter.options.attributeNamePrefix}defaultedgetype`]: this.graphAttributes.edgeType
                },
                [`${GraphFormatConverter.options.attributeNamePrefix}version`]: 1.3,
                [`${GraphFormatConverter.options.attributeNamePrefix}xmlns:viz`]: "http://www.gexf.net/1.3/viz",
                [`${GraphFormatConverter.options.attributeNamePrefix}xmlns:xsi`]: "http://www.w3.org/2001/XMLSchema-instance",
                [`${GraphFormatConverter.options.attributeNamePrefix}xmlns`]: "http://www.gexf.net/1.3",
                [`${GraphFormatConverter.options.attributeNamePrefix}xsi:schemaLocation`]: "http://www.gexf.net/1.3 http://www.gexf.net/1.3/gexf.xsd"
            }
        }

        // Build the document
        const builder = new XMLBuilder(GraphFormatConverter.options);

        // Return the XML built and "fix" the <?xml ... /></?xml> to <?xml ... ?>
        return builder.build(root).replace(/><\/\?xml>/, "?>");
    }

    /**
     * Get the Graphml format of the graph
     * @return string The graph a Graphml string Object
     */
    public toGraphml = (): string => {

        // Variables to know if the attributes already exists
        let doesColorNotExistForNodes,doesColorNotExistForEdges , doesXNotExistForNodes , doesYNotExistForNodes , doesZNotExistForNodes , doesXNotExistForEdges , doesYNotExistForEdges , doesZNotExistForEdges, doesLabelNotExistForNodes , doesLabelNotExistForEdges, doesEdgelabelNotExistForEdges, doesSizeNotExistForNodes, doesSizeNotExistForEdges, doesShapeNotExistForNodes, doesShapeNotExistForEdges, doesWeightNotExistForEdges, doesThicknessNotExistForEdges;

        // Get the nodes and the edges as formatted JSON
        const nodes: any[] = this.nodes.map(GraphFormatConverter.getElementAsGraphmlJSON);
        const edges: any[] = this.edges.map(GraphFormatConverter.getElementAsGraphmlJSON);

        // Create the keys (the attributes)
        const keys: any[] = [];
        this.nodeAttributes.forEach((node) => {

            // We need to check if there is the following attributes in the node attributes object
            if (node.id === "x") {doesXNotExistForNodes = false}
            else if (node.id === "y") {doesYNotExistForNodes = false}
            else if (node.id === "z") {doesZNotExistForNodes = false}
            else if (node.id === "size") {doesSizeNotExistForNodes = false}
            else if (node.id === "shape") {doesShapeNotExistForNodes = false}
            else if (node.id === "label") {doesLabelNotExistForNodes = false}
            else if (node.id === "color" || node.id === "r" || node.id === "g" || node.id === "b") {doesColorNotExistForNodes = false}

            keys.push({
                [`${GraphFormatConverter.options.attributeNamePrefix}attr.name`]: node.title,
                [`${GraphFormatConverter.options.attributeNamePrefix}attr.type`]: GraphFormatConverter.jsonTypeToGRAPHML(node.type),
                [`${GraphFormatConverter.options.attributeNamePrefix}for`]: "node",
                [`${GraphFormatConverter.options.attributeNamePrefix}id`]: node.id
            })
        });

        this.edgeAttributes.forEach((edge) => {

            // We need to check if there is the following attributes in the edge attributes object
            if (edge.id === "x") {doesXNotExistForEdges = false}
            else if (edge.id === "y") {doesYNotExistForEdges = false}
            else if (edge.id === "z") {doesZNotExistForEdges = false}
            else if (edge.id === "size") {doesSizeNotExistForEdges = false}
            else if (edge.id === "shape") {doesShapeNotExistForEdges = false}
            else if (edge.id === "weight") {doesWeightNotExistForEdges = false}
            else if (edge.id === "thickness") {doesThicknessNotExistForEdges = false}
            else if (edge.id === "label") {doesLabelNotExistForEdges = false}
            else if (edge.id === "edgelabel") {doesEdgelabelNotExistForEdges = false}
            else if (edge.id === "color" || edge.id === "r" || edge.id === "g" || edge.id === "b") {doesColorNotExistForEdges = false}

            keys.push({
                [`${GraphFormatConverter.options.attributeNamePrefix}attr.name`]: edge.title,
                [`${GraphFormatConverter.options.attributeNamePrefix}attr.type`]: GraphFormatConverter.jsonTypeToGRAPHML(edge.type),
                [`${GraphFormatConverter.options.attributeNamePrefix}for`]: "edge",
                [`${GraphFormatConverter.options.attributeNamePrefix}id`]: edge.id
            })
        });

        // Now we check if the attribute exists in the dataset if it is not already set in the attributes object from below
        doesColorNotExistForNodes = doesColorNotExistForNodes === undefined ? this.nodes.find((node) => node.color !== undefined) !== undefined : false;
        doesColorNotExistForEdges = doesColorNotExistForEdges  === undefined ? this.edges.find((edge) => edge.color !== undefined) !== undefined : false;

        doesLabelNotExistForNodes = doesLabelNotExistForNodes  === undefined ? this.nodes.find((node) => node.label !== undefined) !== undefined : false;
        doesLabelNotExistForEdges = doesLabelNotExistForEdges  === undefined ? this.edges.find((edge) => edge.label !== undefined) !== undefined : false;
        doesEdgelabelNotExistForEdges = doesEdgelabelNotExistForEdges  === undefined ? this.edges.find((edge) => edge.edgelabel !== undefined) !== undefined : false;

        doesSizeNotExistForNodes = doesSizeNotExistForNodes  === undefined ? this.nodes.find((node) => node.size !== undefined) !== undefined : false;
        doesSizeNotExistForEdges = doesSizeNotExistForEdges  === undefined ? this.edges.find((edge) => edge.size !== undefined) !== undefined : false;

        doesShapeNotExistForNodes = doesShapeNotExistForNodes  === undefined ? this.nodes.find((node) => node.shape !== undefined) !== undefined : false;
        doesShapeNotExistForEdges = doesShapeNotExistForEdges  === undefined ? this.edges.find((edge) => edge.shape !== undefined) !== undefined : false;

        doesWeightNotExistForEdges = doesWeightNotExistForEdges  === undefined ? this.edges.find((edge) => edge.weight !== undefined) !== undefined : false;
        doesThicknessNotExistForEdges = doesThicknessNotExistForEdges  === undefined ? this.edges.find((edge) => edge.thickness !== undefined) !== undefined : false;

        doesXNotExistForNodes = doesXNotExistForNodes === undefined  ? this.nodes.find((node) => node.x !== undefined) !== undefined : false;
        doesYNotExistForNodes = doesYNotExistForNodes  === undefined ? this.nodes.find((node) => node.y !== undefined) !== undefined : false;
        doesZNotExistForNodes = doesZNotExistForNodes  === undefined ? this.nodes.find((node) => node.z !== undefined) !== undefined : false;

        doesXNotExistForEdges = doesXNotExistForEdges === undefined  ? this.edges.find((edge) => edge.x !== undefined) !== undefined : false;
        doesYNotExistForEdges = doesYNotExistForEdges === undefined  ? this.edges.find((edge) => edge.y !== undefined) !== undefined : false;
        doesZNotExistForEdges = doesZNotExistForEdges === undefined  ? this.edges.find((edge) => edge.z !== undefined) !== undefined : false;

        // If it does not exist we add it to the attributes manually
        if (doesXNotExistForNodes) {keys.push({[`${GraphFormatConverter.options.attributeNamePrefix}attr.name`]: 'x', [`${GraphFormatConverter.options.attributeNamePrefix}attr.type`]: 'float', [`${GraphFormatConverter.options.attributeNamePrefix}for`]: "node", [`${GraphFormatConverter.options.attributeNamePrefix}id`]: 'x'})}
        if (doesYNotExistForNodes) {keys.push({[`${GraphFormatConverter.options.attributeNamePrefix}attr.name`]: 'y', [`${GraphFormatConverter.options.attributeNamePrefix}attr.type`]: 'float', [`${GraphFormatConverter.options.attributeNamePrefix}for`]: "node", [`${GraphFormatConverter.options.attributeNamePrefix}id`]: 'y'})}
        if (doesZNotExistForNodes) {keys.push({[`${GraphFormatConverter.options.attributeNamePrefix}attr.name`]: 'z', [`${GraphFormatConverter.options.attributeNamePrefix}attr.type`]: 'float', [`${GraphFormatConverter.options.attributeNamePrefix}for`]: "node", [`${GraphFormatConverter.options.attributeNamePrefix}id`]: 'z'})}

        if (doesXNotExistForEdges) {keys.push({[`${GraphFormatConverter.options.attributeNamePrefix}attr.name`]: 'x', [`${GraphFormatConverter.options.attributeNamePrefix}attr.type`]: 'float', [`${GraphFormatConverter.options.attributeNamePrefix}for`]: "edge", [`${GraphFormatConverter.options.attributeNamePrefix}id`]: 'x'})}
        if (doesYNotExistForEdges) {keys.push({[`${GraphFormatConverter.options.attributeNamePrefix}attr.name`]: 'y', [`${GraphFormatConverter.options.attributeNamePrefix}attr.type`]: 'float', [`${GraphFormatConverter.options.attributeNamePrefix}for`]: "edge", [`${GraphFormatConverter.options.attributeNamePrefix}id`]: 'y'})}
        if (doesZNotExistForEdges) {keys.push({[`${GraphFormatConverter.options.attributeNamePrefix}attr.name`]: 'z', [`${GraphFormatConverter.options.attributeNamePrefix}attr.type`]: 'float', [`${GraphFormatConverter.options.attributeNamePrefix}for`]: "edge", [`${GraphFormatConverter.options.attributeNamePrefix}id`]: 'z'})}

        if (doesLabelNotExistForNodes) {keys.push({[`${GraphFormatConverter.options.attributeNamePrefix}attr.name`]: 'label', [`${GraphFormatConverter.options.attributeNamePrefix}attr.type`]: 'string', [`${GraphFormatConverter.options.attributeNamePrefix}for`]: "node", [`${GraphFormatConverter.options.attributeNamePrefix}id`]: 'label'})}
        if (doesLabelNotExistForEdges) {keys.push({[`${GraphFormatConverter.options.attributeNamePrefix}attr.name`]: 'label', [`${GraphFormatConverter.options.attributeNamePrefix}attr.type`]: 'string', [`${GraphFormatConverter.options.attributeNamePrefix}for`]: "edge", [`${GraphFormatConverter.options.attributeNamePrefix}id`]: 'label'})}
        if (doesEdgelabelNotExistForEdges) {keys.push({[`${GraphFormatConverter.options.attributeNamePrefix}attr.name`]: 'edgelabel', [`${GraphFormatConverter.options.attributeNamePrefix}attr.type`]: 'string', [`${GraphFormatConverter.options.attributeNamePrefix}for`]: "edge", [`${GraphFormatConverter.options.attributeNamePrefix}id`]: 'edgelabel'})}

        if (doesSizeNotExistForNodes) {keys.push({[`${GraphFormatConverter.options.attributeNamePrefix}attr.name`]: 'size', [`${GraphFormatConverter.options.attributeNamePrefix}attr.type`]: 'float', [`${GraphFormatConverter.options.attributeNamePrefix}for`]: "node", [`${GraphFormatConverter.options.attributeNamePrefix}id`]: 'size'})}
        if (doesShapeNotExistForNodes) {keys.push({[`${GraphFormatConverter.options.attributeNamePrefix}attr.name`]: 'shape', [`${GraphFormatConverter.options.attributeNamePrefix}attr.type`]: 'string', [`${GraphFormatConverter.options.attributeNamePrefix}for`]: "node", [`${GraphFormatConverter.options.attributeNamePrefix}id`]: 'shape'})}

        if (doesSizeNotExistForEdges) {keys.push({[`${GraphFormatConverter.options.attributeNamePrefix}attr.name`]: 'size', [`${GraphFormatConverter.options.attributeNamePrefix}attr.type`]: 'float', [`${GraphFormatConverter.options.attributeNamePrefix}for`]: "edge", [`${GraphFormatConverter.options.attributeNamePrefix}id`]: 'size'})}
        if (doesShapeNotExistForEdges) {keys.push({[`${GraphFormatConverter.options.attributeNamePrefix}attr.name`]: 'shape', [`${GraphFormatConverter.options.attributeNamePrefix}attr.type`]: 'string', [`${GraphFormatConverter.options.attributeNamePrefix}for`]: "edge", [`${GraphFormatConverter.options.attributeNamePrefix}id`]: 'shape'})}
        if (doesWeightNotExistForEdges) {keys.push({[`${GraphFormatConverter.options.attributeNamePrefix}attr.name`]: 'weight', [`${GraphFormatConverter.options.attributeNamePrefix}attr.type`]: 'float', [`${GraphFormatConverter.options.attributeNamePrefix}for`]: "edge", [`${GraphFormatConverter.options.attributeNamePrefix}id`]: 'weight'})}
        if (doesThicknessNotExistForEdges) {keys.push({[`${GraphFormatConverter.options.attributeNamePrefix}attr.name`]: 'thickness', [`${GraphFormatConverter.options.attributeNamePrefix}attr.type`]: 'float', [`${GraphFormatConverter.options.attributeNamePrefix}for`]: "edge", [`${GraphFormatConverter.options.attributeNamePrefix}id`]: 'thickness'})}

        // We need to set the r, g, and b values for the nodes and the edges
        if (doesColorNotExistForNodes) {
            keys.push({
                [`${GraphFormatConverter.options.attributeNamePrefix}attr.name`]: 'r',
                [`${GraphFormatConverter.options.attributeNamePrefix}attr.type`]: 'int',
                [`${GraphFormatConverter.options.attributeNamePrefix}for`]: "node",
                [`${GraphFormatConverter.options.attributeNamePrefix}id`]: 'r'
            }, {
                [`${GraphFormatConverter.options.attributeNamePrefix}attr.name`]: 'g',
                [`${GraphFormatConverter.options.attributeNamePrefix}attr.type`]: 'int',
                [`${GraphFormatConverter.options.attributeNamePrefix}for`]: "node",
                [`${GraphFormatConverter.options.attributeNamePrefix}id`]: 'g'
            }, {
                [`${GraphFormatConverter.options.attributeNamePrefix}attr.name`]: 'b',
                [`${GraphFormatConverter.options.attributeNamePrefix}attr.type`]: 'int',
                [`${GraphFormatConverter.options.attributeNamePrefix}for`]: "node",
                [`${GraphFormatConverter.options.attributeNamePrefix}id`]: 'b'
            });
        }
        if (doesColorNotExistForEdges) {
            keys.push({
                [`${GraphFormatConverter.options.attributeNamePrefix}attr.name`]: 'r',
                [`${GraphFormatConverter.options.attributeNamePrefix}attr.type`]: 'int',
                [`${GraphFormatConverter.options.attributeNamePrefix}for`]: "edge",
                [`${GraphFormatConverter.options.attributeNamePrefix}id`]: 'r'
            }, {
                [`${GraphFormatConverter.options.attributeNamePrefix}attr.name`]: 'g',
                [`${GraphFormatConverter.options.attributeNamePrefix}attr.type`]: 'int',
                [`${GraphFormatConverter.options.attributeNamePrefix}for`]: "edge",
                [`${GraphFormatConverter.options.attributeNamePrefix}id`]: 'g'
            }, {
                [`${GraphFormatConverter.options.attributeNamePrefix}attr.name`]: 'b',
                [`${GraphFormatConverter.options.attributeNamePrefix}attr.type`]: 'int',
                [`${GraphFormatConverter.options.attributeNamePrefix}for`]: "edge",
                [`${GraphFormatConverter.options.attributeNamePrefix}id`]: 'b'
            });
        }

        // The root element
        const root = {
            "?xml": {
                [`${GraphFormatConverter.options.attributeNamePrefix}version`]: "1.0",
                [`${GraphFormatConverter.options.attributeNamePrefix}encoding`]: "UTF-8",
            },
            "graphml": {
                key: keys,
                "graph": {
                    node: nodes,
                    edge: edges,
                    // If the edgeType is mutual we need to treat it as 'directed'
                    [`${GraphFormatConverter.options.attributeNamePrefix}edgedefault`]: this.graphAttributes.edgeType === "mutual" ? "directed" : this.graphAttributes.edgeType,
                    [`${GraphFormatConverter.options.attributeNamePrefix}id`]: this.graphAttributes.id
                },
                [`${GraphFormatConverter.options.attributeNamePrefix}xmlns`]: "http://graphml.graphdrawing.org/xmlns",
            }
        }

        // Build the document
        const builder = new XMLBuilder(GraphFormatConverter.options);

        // Return the XML built and "fix" the <?xml ... /></?xml> to <?xml ... ?>
        return builder.build(root).replace(/><\/\?xml>/, "?>");
    }

    /**
     * Get an element as a GRAPHML 'fast-xml-parser' JSON object
     * @param element The element
     */
    private static getElementAsGraphmlJSON = (element: any) => {

        // The element as an object
        const elementObject: any = {
            "data": []
        }

        // For each attribute we want to get it a formatted JSON
        Object.entries(element).forEach(([key, value]: [string, any]) => {

            // Switch the name of the attribute to format the object
            switch (key) {

                // If the value is the attributes we create a tree for it
                case "attributes":
                    Object.entries(value).forEach(([elementKey, elementValue]: [string, any]) => {
                        elementObject.data.push({
                            [`${GraphFormatConverter.options.attributeNamePrefix}key`]: elementKey,
                            "#text": `${elementValue}`.replace(new RegExp(/&/, 'g'), "&amp;"),
                        });
                    });
                    break;
                case "id":
                    elementObject[`${GraphFormatConverter.options.attributeNamePrefix}id`] = value;
                    break;
                case "source":
                    elementObject[`${GraphFormatConverter.options.attributeNamePrefix}source`] = value;
                    break;
                case "target":
                    elementObject[`${GraphFormatConverter.options.attributeNamePrefix}target`] = value;
                    break;
                case "color":
                    elementObject.data.push({[`${GraphFormatConverter.options.attributeNamePrefix}key`]: "r", "#text": value.toRgb().r});
                    elementObject.data.push({[`${GraphFormatConverter.options.attributeNamePrefix}key`]: "g", "#text": value.toRgb().g});
                    elementObject.data.push({[`${GraphFormatConverter.options.attributeNamePrefix}key`]: "b", "#text": value.toRgb().b});
                    break;
                default:
                    elementObject.data.push({
                        [`${GraphFormatConverter.options.attributeNamePrefix}key`]: key,
                        '#text': `${value}`.replace(new RegExp(/&/, 'g'), "&amp;"),
                    });
                    break;
            }
        });
        return elementObject;
    }

    /**
     * Get an element as a GEXF 'fast-xml-parser' JSON object
     * @param element The element
     */
    private static getElementAsGexfJSON = (element: any) => {

        // The element as an object
        const elementObject: any = {
            "attvalues": {
                "attvalue": []
            }
        };

        // For each attribute we want to get it a formatted JSON
        Object.entries(element).forEach(([key, value]: [string, any]) => {

            // If the value is the attributes we create a tree for it
            switch (key) {

                // If the value is the attributes we create a tree for it
                case "attributes":
                    Object.entries(value).forEach(([elementKey, elementValue]: [string, any]) => {
                        elementObject.attvalues.attvalue.push({
                            [`${GraphFormatConverter.options.attributeNamePrefix}for`]: elementKey,
                            [`${GraphFormatConverter.options.attributeNamePrefix}value`]: `${elementValue}`.replace(new RegExp(/&/, 'g'), "&amp;"),
                        });
                    });
                    break;
                case "size":
                    elementObject["viz:size"] = {
                        [`${GraphFormatConverter.options.attributeNamePrefix}value`]: value
                    }
                    break;
                case "shape":
                    elementObject["viz:shape"] = {
                        [`${GraphFormatConverter.options.attributeNamePrefix}value`]: value
                    }
                    break;
                case "thickness":
                    elementObject["viz:thickness"] = {
                        [`${GraphFormatConverter.options.attributeNamePrefix}value`]: value
                    }
                    break;
                case "color":
                    elementObject["viz:color"] = {
                        [`${GraphFormatConverter.options.attributeNamePrefix}r`]: value.toRgb().r,
                        [`${GraphFormatConverter.options.attributeNamePrefix}g`]: value.toRgb().g,
                        [`${GraphFormatConverter.options.attributeNamePrefix}b`]: value.toRgb().b
                    }
                    break;
                // The position is set in an other way
                case "x":
                case "y":
                case "z":
                    break;
                default:
                    elementObject[`${GraphFormatConverter.options.attributeNamePrefix}${key}`] = Number.isNaN(value) ? value.replace('&', "&amp;") : value;
                    break;
            }
        });

        // Now we can set the position
        elementObject["viz:position"] = {};
        if (element.x !== undefined) {
            elementObject["viz:position"][`${GraphFormatConverter.options.attributeNamePrefix}x`] = element.x;
        }
        if (element.y !== undefined) {
            elementObject["viz:position"][`${GraphFormatConverter.options.attributeNamePrefix}y`] = element.y;
        }
        if (element.z !== undefined) {
            elementObject["viz:position"][`${GraphFormatConverter.options.attributeNamePrefix}z`] = element.z;
        }

        // If there is no position we remove it as it cannot be empty
        if (Object.keys(elementObject["viz:position"]).length === 0) {
            delete elementObject["viz:position"];
        }

        return elementObject;
    }

    /**
     * Get the JSON type of a GEXF type
     * @param type The GEXF type
     */
    private static gexfTypeToJSON = (type: string): AttributeType => {
        switch (type) {
            case "integer":
            case "long":
            case "double":
            case "float":
                return "number";
            case "boolean":
                return "boolean";
            default:
                return "string";
        }
    }

    /**
     * Get the GEXF type of a JSON type
     * @param type The JSON type
     */
    private static jsonTypeToGEXF = (type: string): string => {
        switch (type) {
            case "number":
                return "double";
            case "boolean":
                return "boolean";
            default:
                return "string";
        }
    }

    /**
     * Get the JSON type of a GRAPHML type
     * @param type The GRAPHML type
     */
    private static graphmlTypeToJSON = (type: string): AttributeType => {
        switch (type) {
            case "int":
            case "long":
            case "double":
            case "float":
                return "number";
            case "boolean":
                return "boolean";
            default:
                return "string";
        }
    }

    /**
     * Get the GRAPHML type of a JSON type
     * @param type The JSON type
     */
    private static jsonTypeToGRAPHML = (type: string): string => {
        switch (type) {
            case "number":
                return "double";
            case "boolean":
                return "boolean";
            default:
                return "string";
        }
    }

    /**
     * Get the type possibilities of a attribute
     * @param key The key of the attribute
     * @param value The value of the attribute to try to guess the type of
     * @param attributesObject The attribute object contain the attributes and their type's count
     */
    private static guessJSONAttribute(key: string, value: any, attributesObject: any) {

        // If the key does not exists
        if (attributesObject[key] === undefined) {
            attributesObject[key] = {
                id: key,
                title: key,
                type: {}
            }
        }

        // Now we get the type and if does not exist we create the counter
        if (attributesObject[key].type[typeof value] === undefined) {
            attributesObject[key].type[typeof value] = 0;
        }

        // Add one to this type
        attributesObject[key].type[typeof value] += 1;
    }

    /**
     * Get the attributes of the nodes/edges from the attributesObject gathered by the function 'guessJSONAttribute'
     * @param attributesObject The attributes object
     */
    private static getAttributesFromGuesser = (attributesObject: any): IAttribute[] => {
        return Object.values(attributesObject).map((value: any) => {
            return {
                id: value.id,
                title: value.title,
                type: Object.entries(value.type).reduce((acc: any, [typeKey, typeValue]: [string, any]) => {

                    // If the accumulator is undefined we set it as the first value
                    if (acc === undefined) {
                        return {type: typeKey, count: typeValue};
                    }

                    // Else we want to know which is bigger between the typeValue and the value of the accumulator
                    if (typeValue > acc.count) {
                        return {type: typeKey, count: typeValue};
                    }

                    // Else return the accumulator
                    return acc;
                }, undefined).type
            }
        });
    }

    /**
     * Get the attributes as a array of objects
     * @param attributes The attributes
     */
    private static getAttributesDefinitionAsObject = (attributes: { attribute: any[] }): IAttribute[] => {

        // if the attributes exist we can get them as an array of objects
        if (attributes !== undefined) {

            // If there is only one attribute we will get an object instead of an array of objects, thus we need to convert it to an array
            let attributesArray = attributes.attribute;
            if (!Array.isArray(attributesArray)) {
                attributesArray = [attributesArray];
            }

            // If the id is "id" we do not add it
            return attributesArray.filter((attribute) => attribute[`${GraphFormatConverter.options.attributeNamePrefix}id`] !== "id" && attribute[`${GraphFormatConverter.options.attributeNamePrefix}id`] !== "source" && attribute[`${GraphFormatConverter.options.attributeNamePrefix}id`] !== "target").map((attribute) => {
                return {
                    id: attribute[`${GraphFormatConverter.options.attributeNamePrefix}id`],
                    title: attribute[`${GraphFormatConverter.options.attributeNamePrefix}title`],
                    type: GraphFormatConverter.gexfTypeToJSON(attribute[`${GraphFormatConverter.options.attributeNamePrefix}type`]),
                }
            });
        }

        // Otherwise return an empty array
        else {
            return [];
        }
    }

    /**
     * Get the attributes (as well as nested attributes of an element) from a GEXF element
     * @param element The element to gather the attributes of
     */
    private static getGexfElementAttributes = (element: any): any => {

        // The object that will contain the attributes
        const elementData: any = {attributes: {}};

        // For each attribute we want to act differently
        Object.entries(element).forEach(([key, value]: [string, any]) => {

            // If the current value is the attributes
            if (key === "attvalues") {

                // If there is only one attribute we will get an object instead of an array of objects, thus we need to convert it to an array
                let attributesArray = value["attvalue"];
                if (!Array.isArray(attributesArray)) {
                    attributesArray = [attributesArray];
                }

                attributesArray.forEach((attributeObject: any) => {
                    elementData.attributes[attributeObject[`${GraphFormatConverter.options.attributeNamePrefix}for`]] = attributeObject[`${GraphFormatConverter.options.attributeNamePrefix}value`];
                });
            }

            // If the key does contain the GraphFormatConverter.options.attributeNamePrefix prefix
            else if (key.includes(GraphFormatConverter.options.attributeNamePrefix)) {
                elementData[key.replace(GraphFormatConverter.options.attributeNamePrefix, '')] = value;
            }

            // Else we have some cases that need to be treated separately
            else {
                switch (key) {
                    case "color":
                        elementData.color = tinycolor2(`rgb(${value[`${GraphFormatConverter.options.attributeNamePrefix}r`]}, ${value[`${GraphFormatConverter.options.attributeNamePrefix}g`]}, ${value[`${GraphFormatConverter.options.attributeNamePrefix}b`]})`);
                        break;
                    case "position":
                        elementData.x = Number(value[`${GraphFormatConverter.options.attributeNamePrefix}x`]);
                        elementData.y = Number(value[`${GraphFormatConverter.options.attributeNamePrefix}y`]);
                        if (value[`${GraphFormatConverter.options.attributeNamePrefix}z`] !== undefined) {
                            elementData.z = Number(value[`${GraphFormatConverter.options.attributeNamePrefix}z`]);
                        }
                        break;
                    case "size":
                        elementData.size = Number(value[`${GraphFormatConverter.options.attributeNamePrefix}value`]);
                        break;
                    case "thickness":
                        elementData.size = Number(value[`${GraphFormatConverter.options.attributeNamePrefix}value`]);
                        break;
                    case "shape":
                        elementData.size = Number(value[`${GraphFormatConverter.options.attributeNamePrefix}value`]);
                        break;
                    default:
                        elementData[key] = value;
                        break;
                }
            }
        });

        return elementData;
    }

    /**
     * Get the attributes (as well as nested attributes of an element) from a Graphml element
     * @param element The element to gather the attributes of
     */
    private static getGraphmlElementAttributes = (element: any): any => {

        // The object that will contain the attributes
        const elementData: any = {attributes: {}};

        // For each attribute we want to act differently
        Object.entries(element).forEach(([key, value]: [string, any]) => {

            // If the current value is the attributes
            if (key === "data") {

                // If there is only one attribute we will get an object instead of an array of objects, thus we need to convert it to an array
                let attributesArray = value;
                if (!Array.isArray(attributesArray)) {
                    attributesArray = [attributesArray];
                }

                attributesArray.forEach((attributeObject: any) => {
                    elementData.attributes[attributeObject[`${GraphFormatConverter.options.attributeNamePrefix}key`]] = attributeObject[`#text`];
                });
            }

            // If the key does contain the GraphFormatConverter.options.attributeNamePrefix prefix
            else if (key.includes(GraphFormatConverter.options.attributeNamePrefix)) {
                elementData[key.replace(GraphFormatConverter.options.attributeNamePrefix, '')] = value;
            }
        });

        // For the color (fields r, g and b) we want to remove them and set color
        if (elementData.attributes.r !== undefined && elementData.attributes.g !== undefined && elementData.attributes.b !== undefined) {
            elementData.color = tinycolor2(`rgb(${elementData.attributes.r}, ${elementData.attributes.g}, ${elementData.attributes.b})`);
            delete elementData.attributes.r;
            delete elementData.attributes.g;
            delete elementData.attributes.b;
        }

        // We need to set the position to the "main" attributes
        if (elementData.attributes.x !== undefined) {
            elementData.x = elementData.attributes.x
            delete elementData.attributes.x;
        }
        if (elementData.attributes.y !== undefined) {
            elementData.y = elementData.attributes.y
            delete elementData.attributes.y;
        }
        if (elementData.attributes.x !== undefined) {
            elementData.z = elementData.attributes.z
            delete elementData.attributes.z;
        }

        // We need to set the size to the "main" attributes
        if (elementData.attributes.size) {
            elementData.size = elementData.attributes.size;
            delete elementData.attributes.size;
        }

        // We need to set the shape to the "main" attributes
        if (elementData.attributes.shape) {
            elementData.shape = elementData.attributes.shape;
            delete elementData.attributes.shape;
        }

        // We need to set the thickness to the "main" attributes
        if (elementData.attributes.thickness) {
            elementData.thickness = elementData.attributes.thickness;
            delete elementData.attributes.thickness;
        }

        // We need to set the weight to the "main" attributes
        if (elementData.attributes.weight) {
            elementData.weight = elementData.attributes.weight;
            delete elementData.attributes.weight;
        }

        // We need to set the label to the "main" attributes
        if (elementData.attributes.label) {
            elementData.label = elementData.attributes.label;
            delete elementData.attributes.label;
        }

        // We need to set the edgelabel to the "main" attributes
        if (elementData.attributes.edgelabel) {
            elementData.edgelabel = elementData.attributes.edgelabel;
            delete elementData.attributes.edgelabel;
        }

        // We need to set the start to the "main" attributes
        if (elementData.attributes.start) {
            elementData.start = elementData.attributes.start;
            delete elementData.attributes.start;
        }

        // We need to set the end to the "main" attributes
        if (elementData.attributes.end) {
            elementData.end = elementData.attributes.end;
            delete elementData.attributes.end;
        }

        return elementData;
    }

    /**
     * Get the nodes of the graph on a JSON format
     * @return any[] The nodes of the graph
     */
    public getNodes = (): any[] => {
        return this.nodes;
    }

    /**
     * Get the edges of the graph on a JSON format
     * @return any[] The edges of the graph
     */
    public getEdges = (): any[] => {
        return this.nodes;
    }
}