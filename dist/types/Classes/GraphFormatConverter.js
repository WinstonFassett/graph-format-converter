"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphFormatConverter = void 0;
var fast_xml_parser_1 = require("fast-xml-parser");
var tinycolor2_1 = __importDefault(require("tinycolor2"));
/**
 * The GraphFormatConverter class
 */
var GraphFormatConverter = /** @class */ (function () {
    /**
     * The constructor of the graph
     * @param nodes The nodes of the graph
     * @param edges The edges of the graph
     * @param nodeAttributes The attributes a node can take
     * @param edgeAttributes The attributes an edge can take
     * @param graphAttributes The attributes of a graph
     * @private
     */
    function GraphFormatConverter(nodes, edges, nodeAttributes, edgeAttributes, graphAttributes) {
        var _this = this;
        if (nodes === void 0) { nodes = []; }
        if (edges === void 0) { edges = []; }
        if (nodeAttributes === void 0) { nodeAttributes = []; }
        if (edgeAttributes === void 0) { edgeAttributes = []; }
        if (graphAttributes === void 0) { graphAttributes = {
            id: "graph",
            edgeType: "undirected",
            mode: "static"
        }; }
        this.nodes = nodes;
        this.edges = edges;
        this.nodeAttributes = nodeAttributes;
        this.edgeAttributes = edgeAttributes;
        this.graphAttributes = graphAttributes;
        /**
         * Get the JSON format of the graph
         * @return {nodes: any[], edges: any[]} The graph a JSON Object
         */
        this.toJson = function () {
            return {
                attributes: _this.getAttributes(),
                nodes: _this.getNodes().map(function (node) {
                    if (node.color !== undefined) {
                        node.color = (0, tinycolor2_1.default)(node.color).toRgbString();
                    }
                    return node;
                }),
                edges: _this.getEdges().map(function (edge) {
                    if (edge.color !== undefined) {
                        edge.color = (0, tinycolor2_1.default)(edge.color).toRgbString();
                    }
                    return edge;
                })
            };
        };
        /**
         * Get the JSON Graphology format of the graph
         * @return {nodes: any[], edges: any[], attributes: any[]} The graph a JSON Object
         */
        this.toGraphology = function () {
            return {
                attributes: __assign({ name: _this.getAttributes().id }, _this.getAttributes()),
                nodes: _this.getNodes().map(function (node) {
                    if (node.color !== undefined) {
                        node.color = (0, tinycolor2_1.default)(node.color).toRgbString();
                    }
                    // If there is not key, set it with the id
                    if (node.key === undefined) {
                        node.key = node.id;
                    }
                    return node;
                }),
                edges: _this.getEdges().map(function (edge) {
                    if (edge.color !== undefined) {
                        edge.color = (0, tinycolor2_1.default)(edge.color).toRgbString();
                    }
                    // If there is not key, set it with the id if it exists, else we don't care
                    if (edge.key === undefined && edge.id !== undefined) {
                        edge.key = edge.id;
                    }
                    // Si if the graph is undirected
                    edge.undirected = _this.getAttributes().edgeType === "undirected";
                    return edge;
                })
            };
        };
        /**
         * Get the GEXF format of the graph
         * @return string The graph a GEXF string Object
         */
        this.toGexf = function () {
            var _a, _b, _c, _d, _e;
            // Get the nodes and the edges as formatted JSON
            var nodes = _this.getNodes().map(GraphFormatConverter.getElementAsGexfJSON);
            var edges = _this.getEdges().map(GraphFormatConverter.getElementAsGexfJSON);
            // The attributes a node can take
            var nodeAttributes = _this.nodeAttributes.map(function (attribute) {
                var _a;
                return _a = {},
                    _a[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = attribute.id,
                    _a[GraphFormatConverter.parserOptions.attributeNamePrefix + "title"] = attribute.title,
                    _a[GraphFormatConverter.parserOptions.attributeNamePrefix + "type"] = GraphFormatConverter.jsonTypeToGEXF(attribute.type),
                    _a;
            });
            // The attributes an edge can take
            var edgeAttributes = _this.edgeAttributes.map(function (attribute) {
                var _a;
                return _a = {},
                    _a[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = attribute.id,
                    _a[GraphFormatConverter.parserOptions.attributeNamePrefix + "title"] = attribute.title,
                    _a[GraphFormatConverter.parserOptions.attributeNamePrefix + "type"] = GraphFormatConverter.jsonTypeToGEXF(attribute.type),
                    _a;
            });
            // The root object
            var root = {
                "?xml": (_a = {},
                    _a[GraphFormatConverter.parserOptions.attributeNamePrefix + "version"] = "1.0",
                    _a[GraphFormatConverter.parserOptions.attributeNamePrefix + "encoding"] = "UTF-8",
                    _a),
                "gexf": (_b = {
                        "graph": (_c = {
                                attributes: [
                                    (_d = {
                                            attribute: nodeAttributes
                                        },
                                        _d[GraphFormatConverter.parserOptions.attributeNamePrefix + "class"] = "node",
                                        _d[GraphFormatConverter.parserOptions.attributeNamePrefix + "mode"] = "static",
                                        _d),
                                    (_e = {
                                            attribute: edgeAttributes
                                        },
                                        _e[GraphFormatConverter.parserOptions.attributeNamePrefix + "class"] = "edge",
                                        _e[GraphFormatConverter.parserOptions.attributeNamePrefix + "mode"] = "static",
                                        _e)
                                ],
                                nodes: {
                                    node: nodes
                                },
                                edges: {
                                    edge: edges
                                }
                            },
                            _c[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = _this.graphAttributes.id,
                            _c[GraphFormatConverter.parserOptions.attributeNamePrefix + "mode"] = _this.graphAttributes.mode,
                            _c[GraphFormatConverter.parserOptions.attributeNamePrefix + "defaultedgetype"] = _this.graphAttributes.edgeType,
                            _c)
                    },
                    _b[GraphFormatConverter.parserOptions.attributeNamePrefix + "version"] = 1.3,
                    _b[GraphFormatConverter.parserOptions.attributeNamePrefix + "xmlns:viz"] = "http://www.gexf.net/1.3/viz",
                    _b[GraphFormatConverter.parserOptions.attributeNamePrefix + "xmlns:xsi"] = "http://www.w3.org/2001/XMLSchema-instance",
                    _b[GraphFormatConverter.parserOptions.attributeNamePrefix + "xmlns"] = "http://www.gexf.net/1.3",
                    _b[GraphFormatConverter.parserOptions.attributeNamePrefix + "xsi:schemaLocation"] = "http://www.gexf.net/1.3 http://www.gexf.net/1.3/gexf.xsd",
                    _b)
            };
            // Build the document
            var builder = new fast_xml_parser_1.XMLBuilder(GraphFormatConverter.builderOptions);
            // Return the XML built and "fix" the <?xml ... /></?xml> to <?xml ... ?> and replace the backspace chars
            return builder.build(root).replace(/><\/\?xml>/, "?>").replace(new RegExp("\b", ""), "");
        };
        /**
         * Get the Graphml format of the graph
         * @return string The graph a Graphml string Object
         */
        this.toGraphml = function () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
            // Variables to know if the attributes already exists
            var doesColorNotExistForNodes, doesColorNotExistForEdges, doesXNotExistForNodes, doesYNotExistForNodes, doesZNotExistForNodes, doesXNotExistForEdges, doesYNotExistForEdges, doesZNotExistForEdges, doesLabelNotExistForNodes, doesLabelNotExistForEdges, doesEdgelabelNotExistForEdges, doesSizeNotExistForNodes, doesSizeNotExistForEdges, doesShapeNotExistForNodes, doesShapeNotExistForEdges, doesWeightNotExistForEdges, doesThicknessNotExistForEdges;
            // Get the nodes and the edges as formatted JSON
            var nodes = _this.getNodes().map(GraphFormatConverter.getElementAsGraphmlJSON);
            var edges = _this.getEdges().map(GraphFormatConverter.getElementAsGraphmlJSON);
            // Create the keys (the attributes)
            var keys = [];
            _this.nodeAttributes.forEach(function (node) {
                var _a;
                // We need to check if there is the following attributes in the node attributes object
                if (node.id === "x") {
                    doesXNotExistForNodes = false;
                }
                else if (node.id === "y") {
                    doesYNotExistForNodes = false;
                }
                else if (node.id === "z") {
                    doesZNotExistForNodes = false;
                }
                else if (node.id === "size") {
                    doesSizeNotExistForNodes = false;
                }
                else if (node.id === "shape") {
                    doesShapeNotExistForNodes = false;
                }
                else if (node.id === "label") {
                    doesLabelNotExistForNodes = false;
                }
                else if (node.id === "color" || node.id === "r" || node.id === "g" || node.id === "b") {
                    doesColorNotExistForNodes = false;
                }
                keys.push((_a = {},
                    _a[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = node.title,
                    _a[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = GraphFormatConverter.jsonTypeToGRAPHML(node.type),
                    _a[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "node",
                    _a[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = node.id,
                    _a));
            });
            _this.edgeAttributes.forEach(function (edge) {
                var _a;
                // We need to check if there is the following attributes in the edge attributes object
                if (edge.id === "x") {
                    doesXNotExistForEdges = false;
                }
                else if (edge.id === "y") {
                    doesYNotExistForEdges = false;
                }
                else if (edge.id === "z") {
                    doesZNotExistForEdges = false;
                }
                else if (edge.id === "size") {
                    doesSizeNotExistForEdges = false;
                }
                else if (edge.id === "shape") {
                    doesShapeNotExistForEdges = false;
                }
                else if (edge.id === "weight") {
                    doesWeightNotExistForEdges = false;
                }
                else if (edge.id === "thickness") {
                    doesThicknessNotExistForEdges = false;
                }
                else if (edge.id === "label") {
                    doesLabelNotExistForEdges = false;
                }
                else if (edge.id === "edgelabel") {
                    doesEdgelabelNotExistForEdges = false;
                }
                else if (edge.id === "color" || edge.id === "r" || edge.id === "g" || edge.id === "b") {
                    doesColorNotExistForEdges = false;
                }
                keys.push((_a = {},
                    _a[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = edge.title,
                    _a[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = GraphFormatConverter.jsonTypeToGRAPHML(edge.type),
                    _a[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "edge",
                    _a[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = edge.id,
                    _a));
            });
            // Now we check if the attribute exists in the dataset if it is not already set in the attributes object from below
            doesColorNotExistForNodes = doesColorNotExistForNodes === undefined ? _this.nodes.find(function (node) { return node.color !== undefined; }) !== undefined : false;
            doesColorNotExistForEdges = doesColorNotExistForEdges === undefined ? _this.edges.find(function (edge) { return edge.color !== undefined; }) !== undefined : false;
            doesLabelNotExistForNodes = doesLabelNotExistForNodes === undefined ? _this.nodes.find(function (node) { return node.label !== undefined; }) !== undefined : false;
            doesLabelNotExistForEdges = doesLabelNotExistForEdges === undefined ? _this.edges.find(function (edge) { return edge.label !== undefined; }) !== undefined : false;
            doesEdgelabelNotExistForEdges = doesEdgelabelNotExistForEdges === undefined ? _this.edges.find(function (edge) { return edge.edgelabel !== undefined; }) !== undefined : false;
            doesSizeNotExistForNodes = doesSizeNotExistForNodes === undefined ? _this.nodes.find(function (node) { return node.size !== undefined; }) !== undefined : false;
            doesSizeNotExistForEdges = doesSizeNotExistForEdges === undefined ? _this.edges.find(function (edge) { return edge.size !== undefined; }) !== undefined : false;
            doesShapeNotExistForNodes = doesShapeNotExistForNodes === undefined ? _this.nodes.find(function (node) { return node.shape !== undefined; }) !== undefined : false;
            doesShapeNotExistForEdges = doesShapeNotExistForEdges === undefined ? _this.edges.find(function (edge) { return edge.shape !== undefined; }) !== undefined : false;
            doesWeightNotExistForEdges = doesWeightNotExistForEdges === undefined ? _this.edges.find(function (edge) { return edge.weight !== undefined; }) !== undefined : false;
            doesThicknessNotExistForEdges = doesThicknessNotExistForEdges === undefined ? _this.edges.find(function (edge) { return edge.thickness !== undefined; }) !== undefined : false;
            doesXNotExistForNodes = doesXNotExistForNodes === undefined ? _this.nodes.find(function (node) { return node.x !== undefined; }) !== undefined : false;
            doesYNotExistForNodes = doesYNotExistForNodes === undefined ? _this.nodes.find(function (node) { return node.y !== undefined; }) !== undefined : false;
            doesZNotExistForNodes = doesZNotExistForNodes === undefined ? _this.nodes.find(function (node) { return node.z !== undefined; }) !== undefined : false;
            doesXNotExistForEdges = doesXNotExistForEdges === undefined ? _this.edges.find(function (edge) { return edge.x !== undefined; }) !== undefined : false;
            doesYNotExistForEdges = doesYNotExistForEdges === undefined ? _this.edges.find(function (edge) { return edge.y !== undefined; }) !== undefined : false;
            doesZNotExistForEdges = doesZNotExistForEdges === undefined ? _this.edges.find(function (edge) { return edge.z !== undefined; }) !== undefined : false;
            // If it does not exist we add it to the attributes manually
            if (doesXNotExistForNodes) {
                keys.push((_a = {}, _a[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'x', _a[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'float', _a[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "node", _a[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'x', _a));
            }
            if (doesYNotExistForNodes) {
                keys.push((_b = {}, _b[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'y', _b[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'float', _b[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "node", _b[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'y', _b));
            }
            if (doesZNotExistForNodes) {
                keys.push((_c = {}, _c[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'z', _c[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'float', _c[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "node", _c[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'z', _c));
            }
            if (doesXNotExistForEdges) {
                keys.push((_d = {}, _d[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'x', _d[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'float', _d[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "edge", _d[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'x', _d));
            }
            if (doesYNotExistForEdges) {
                keys.push((_e = {}, _e[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'y', _e[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'float', _e[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "edge", _e[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'y', _e));
            }
            if (doesZNotExistForEdges) {
                keys.push((_f = {}, _f[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'z', _f[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'float', _f[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "edge", _f[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'z', _f));
            }
            if (doesLabelNotExistForNodes) {
                keys.push((_g = {}, _g[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'label', _g[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'string', _g[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "node", _g[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'label', _g));
            }
            if (doesLabelNotExistForEdges) {
                keys.push((_h = {}, _h[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'label', _h[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'string', _h[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "edge", _h[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'label', _h));
            }
            if (doesEdgelabelNotExistForEdges) {
                keys.push((_j = {}, _j[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'edgelabel', _j[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'string', _j[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "edge", _j[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'edgelabel', _j));
            }
            if (doesSizeNotExistForNodes) {
                keys.push((_k = {}, _k[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'size', _k[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'float', _k[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "node", _k[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'size', _k));
            }
            if (doesShapeNotExistForNodes) {
                keys.push((_l = {}, _l[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'shape', _l[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'string', _l[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "node", _l[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'shape', _l));
            }
            if (doesSizeNotExistForEdges) {
                keys.push((_m = {}, _m[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'size', _m[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'float', _m[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "edge", _m[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'size', _m));
            }
            if (doesShapeNotExistForEdges) {
                keys.push((_o = {}, _o[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'shape', _o[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'string', _o[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "edge", _o[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'shape', _o));
            }
            if (doesWeightNotExistForEdges) {
                keys.push((_p = {}, _p[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'weight', _p[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'float', _p[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "edge", _p[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'weight', _p));
            }
            if (doesThicknessNotExistForEdges) {
                keys.push((_q = {}, _q[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'thickness', _q[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'float', _q[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "edge", _q[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'thickness', _q));
            }
            // We need to set the r, g, and b values for the nodes and the edges
            if (doesColorNotExistForNodes) {
                keys.push((_r = {},
                    _r[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'r',
                    _r[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'int',
                    _r[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "node",
                    _r[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'r',
                    _r), (_s = {},
                    _s[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'g',
                    _s[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'int',
                    _s[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "node",
                    _s[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'g',
                    _s), (_t = {},
                    _t[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'b',
                    _t[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'int',
                    _t[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "node",
                    _t[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'b',
                    _t));
            }
            if (doesColorNotExistForEdges) {
                keys.push((_u = {},
                    _u[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'r',
                    _u[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'int',
                    _u[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "edge",
                    _u[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'r',
                    _u), (_v = {},
                    _v[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'g',
                    _v[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'int',
                    _v[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "edge",
                    _v[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'g',
                    _v), (_w = {},
                    _w[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'b',
                    _w[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'int',
                    _w[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "edge",
                    _w[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'b',
                    _w));
            }
            // The root element
            var root = {
                "?xml": (_x = {},
                    _x[GraphFormatConverter.parserOptions.attributeNamePrefix + "version"] = "1.0",
                    _x[GraphFormatConverter.parserOptions.attributeNamePrefix + "encoding"] = "UTF-8",
                    _x),
                "graphml": (_y = {
                        key: keys,
                        "graph": (_z = {
                                node: nodes,
                                edge: edges
                            },
                            // If the edgeType is mutual we need to treat it as 'directed'
                            _z[GraphFormatConverter.parserOptions.attributeNamePrefix + "edgedefault"] = _this.graphAttributes.edgeType === "mutual" ? "directed" : _this.graphAttributes.edgeType,
                            _z[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = _this.graphAttributes.id,
                            _z)
                    },
                    _y[GraphFormatConverter.parserOptions.attributeNamePrefix + "xmlns"] = "http://graphml.graphdrawing.org/xmlns",
                    _y)
            };
            // Build the document
            var builder = new fast_xml_parser_1.XMLBuilder(GraphFormatConverter.builderOptions);
            // Return the XML built and "fix" the <?xml ... /></?xml> to <?xml ... ?> and replace the backspace chars
            return builder.build(root).replace(/><\/\?xml>/, "?>").replace("\b", "");
        };
        /**
     * Get the Graphml format of the graph
         * @return string The graph a Graphml string Object
         */
        this.toYedGraphml = function () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
            // Variables to know if the attributes already exists
            var doesColorNotExistForNodes, doesColorNotExistForEdges, doesXNotExistForNodes, doesYNotExistForNodes, doesZNotExistForNodes, doesXNotExistForEdges, doesYNotExistForEdges, doesZNotExistForEdges, doesLabelNotExistForNodes, doesLabelNotExistForEdges, doesEdgelabelNotExistForEdges, doesSizeNotExistForNodes, doesSizeNotExistForEdges, doesShapeNotExistForNodes, doesShapeNotExistForEdges, doesWeightNotExistForEdges, doesThicknessNotExistForEdges;
            // Get the nodes and the edges as formatted JSON
            var nodes = _this.getNodes().map(GraphFormatConverter.getElementAsYedGraphmlJSON);
            var edges = _this.getEdges().map(GraphFormatConverter.getElementAsYedGraphmlJSON, 'edge');
            // Create the keys (the attributes)
            var keys = [];
            _this.nodeAttributes.forEach(function (node) {
                var _a, _b;
                // We need to check if there is the following attributes in the node attributes object
                if (node.id === "x") {
                    doesXNotExistForNodes = false;
                }
                else if (node.id === "y") {
                    doesYNotExistForNodes = false;
                }
                else if (node.id === "z") {
                    doesZNotExistForNodes = false;
                }
                else if (node.id === "size") {
                    doesSizeNotExistForNodes = false;
                }
                else if (node.id === "shape") {
                    doesShapeNotExistForNodes = false;
                }
                else if (node.id === "label") {
                    doesLabelNotExistForNodes = false;
                    // <key id="d4" for="node" attr.name="NodeLabels" y:attr.uri="http://www.yworks.com/xml/yfiles-common/2.0/NodeLabels"/>
                    keys.push((_a = {},
                        // [`${GraphFormatConverter.parserOptions.attributeNamePrefix}attr.name`]: node.title,
                        // [`${GraphFormatConverter.parserOptions.attributeNamePrefix}attr.name`]: 'NodeLabels',
                        // [`${GraphFormatConverter.parserOptions.attributeNamePrefix}attr.type`]: GraphFormatConverter.jsonTypeToGRAPHML(node.type),
                        _a[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "node",
                        // [`${GraphFormatConverter.parserOptions.attributeNamePrefix}id`]: node.id
                        _a[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'd4',
                        _a[GraphFormatConverter.parserOptions.attributeNamePrefix + "yfiles.type"] = "nodegraphics",
                        _a));
                    return;
                }
                else if (node.id === "color" || node.id === "r" || node.id === "g" || node.id === "b") {
                    doesColorNotExistForNodes = false;
                }
                keys.push((_b = {},
                    _b[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = node.title,
                    _b[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = GraphFormatConverter.jsonTypeToGRAPHML(node.type),
                    _b[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "node",
                    _b[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = node.id,
                    _b));
            });
            _this.edgeAttributes.forEach(function (edge) {
                var _a, _b;
                // We need to check if there is the following attributes in the edge attributes object
                if (edge.id === "x") {
                    doesXNotExistForEdges = false;
                }
                else if (edge.id === "y") {
                    doesYNotExistForEdges = false;
                }
                else if (edge.id === "z") {
                    doesZNotExistForEdges = false;
                }
                else if (edge.id === "size") {
                    doesSizeNotExistForEdges = false;
                }
                else if (edge.id === "shape") {
                    doesShapeNotExistForEdges = false;
                }
                else if (edge.id === "weight") {
                    doesWeightNotExistForEdges = false;
                }
                else if (edge.id === "thickness") {
                    doesThicknessNotExistForEdges = false;
                }
                else if (edge.id === "label") {
                    doesLabelNotExistForEdges = false;
                    // <key id="d4" for="node" attr.name="NodeLabels" y:attr.uri="http://www.yworks.com/xml/yfiles-common/2.0/NodeLabels"/>
                    keys.push((_a = {},
                        // [`${GraphFormatConverter.parserOptions.attributeNamePrefix}attr.name`]: node.title,
                        // [`${GraphFormatConverter.parserOptions.attributeNamePrefix}attr.name`]: 'NodeLabels',
                        // [`${GraphFormatConverter.parserOptions.attributeNamePrefix}attr.type`]: GraphFormatConverter.jsonTypeToGRAPHML(node.type),
                        _a[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "edge",
                        // [`${GraphFormatConverter.parserOptions.attributeNamePrefix}id`]: node.id
                        _a[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'd9',
                        _a[GraphFormatConverter.parserOptions.attributeNamePrefix + "yfiles.type"] = "edgegraphics",
                        _a));
                    return;
                }
                else if (edge.id === "edgelabel") {
                    doesEdgelabelNotExistForEdges = false;
                }
                else if (edge.id === "color" || edge.id === "r" || edge.id === "g" || edge.id === "b") {
                    doesColorNotExistForEdges = false;
                }
                keys.push((_b = {},
                    _b[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = edge.title,
                    _b[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = GraphFormatConverter.jsonTypeToGRAPHML(edge.type),
                    _b[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "edge",
                    _b[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = edge.id,
                    _b));
            });
            // Now we check if the attribute exists in the dataset if it is not already set in the attributes object from below
            doesColorNotExistForNodes = doesColorNotExistForNodes === undefined ? _this.nodes.find(function (node) { return node.color !== undefined; }) !== undefined : false;
            doesColorNotExistForEdges = doesColorNotExistForEdges === undefined ? _this.edges.find(function (edge) { return edge.color !== undefined; }) !== undefined : false;
            doesLabelNotExistForNodes = doesLabelNotExistForNodes === undefined ? _this.nodes.find(function (node) { return node.label !== undefined; }) !== undefined : false;
            doesLabelNotExistForEdges = doesLabelNotExistForEdges === undefined ? _this.edges.find(function (edge) { return edge.label !== undefined; }) !== undefined : false;
            doesEdgelabelNotExistForEdges = doesEdgelabelNotExistForEdges === undefined ? _this.edges.find(function (edge) { return edge.edgelabel !== undefined; }) !== undefined : false;
            doesSizeNotExistForNodes = doesSizeNotExistForNodes === undefined ? _this.nodes.find(function (node) { return node.size !== undefined; }) !== undefined : false;
            doesSizeNotExistForEdges = doesSizeNotExistForEdges === undefined ? _this.edges.find(function (edge) { return edge.size !== undefined; }) !== undefined : false;
            doesShapeNotExistForNodes = doesShapeNotExistForNodes === undefined ? _this.nodes.find(function (node) { return node.shape !== undefined; }) !== undefined : false;
            doesShapeNotExistForEdges = doesShapeNotExistForEdges === undefined ? _this.edges.find(function (edge) { return edge.shape !== undefined; }) !== undefined : false;
            doesWeightNotExistForEdges = doesWeightNotExistForEdges === undefined ? _this.edges.find(function (edge) { return edge.weight !== undefined; }) !== undefined : false;
            doesThicknessNotExistForEdges = doesThicknessNotExistForEdges === undefined ? _this.edges.find(function (edge) { return edge.thickness !== undefined; }) !== undefined : false;
            doesXNotExistForNodes = doesXNotExistForNodes === undefined ? _this.nodes.find(function (node) { return node.x !== undefined; }) !== undefined : false;
            doesYNotExistForNodes = doesYNotExistForNodes === undefined ? _this.nodes.find(function (node) { return node.y !== undefined; }) !== undefined : false;
            doesZNotExistForNodes = doesZNotExistForNodes === undefined ? _this.nodes.find(function (node) { return node.z !== undefined; }) !== undefined : false;
            doesXNotExistForEdges = doesXNotExistForEdges === undefined ? _this.edges.find(function (edge) { return edge.x !== undefined; }) !== undefined : false;
            doesYNotExistForEdges = doesYNotExistForEdges === undefined ? _this.edges.find(function (edge) { return edge.y !== undefined; }) !== undefined : false;
            doesZNotExistForEdges = doesZNotExistForEdges === undefined ? _this.edges.find(function (edge) { return edge.z !== undefined; }) !== undefined : false;
            // If it does not exist we add it to the attributes manually
            if (doesXNotExistForNodes) {
                keys.push((_a = {}, _a[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'x', _a[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'float', _a[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "node", _a[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'x', _a));
            }
            if (doesYNotExistForNodes) {
                keys.push((_b = {}, _b[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'y', _b[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'float', _b[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "node", _b[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'y', _b));
            }
            if (doesZNotExistForNodes) {
                keys.push((_c = {}, _c[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'z', _c[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'float', _c[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "node", _c[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'z', _c));
            }
            if (doesXNotExistForEdges) {
                keys.push((_d = {}, _d[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'x', _d[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'float', _d[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "edge", _d[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'x', _d));
            }
            if (doesYNotExistForEdges) {
                keys.push((_e = {}, _e[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'y', _e[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'float', _e[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "edge", _e[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'y', _e));
            }
            if (doesZNotExistForEdges) {
                keys.push((_f = {}, _f[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'z', _f[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'float', _f[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "edge", _f[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'z', _f));
            }
            if (doesLabelNotExistForNodes) {
                keys.push((_g = {}, _g[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'label', _g[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'string', _g[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "node", _g[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'label', _g));
            }
            if (doesLabelNotExistForEdges) {
                keys.push((_h = {}, _h[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'label', _h[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'string', _h[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "edge", _h[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'label', _h));
            }
            if (doesEdgelabelNotExistForEdges) {
                keys.push((_j = {}, _j[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'edgelabel', _j[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'string', _j[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "edge", _j[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'edgelabel', _j));
            }
            if (doesSizeNotExistForNodes) {
                keys.push((_k = {}, _k[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'size', _k[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'float', _k[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "node", _k[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'size', _k));
            }
            if (doesShapeNotExistForNodes) {
                keys.push((_l = {}, _l[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'shape', _l[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'string', _l[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "node", _l[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'shape', _l));
            }
            if (doesSizeNotExistForEdges) {
                keys.push((_m = {}, _m[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'size', _m[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'float', _m[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "edge", _m[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'size', _m));
            }
            if (doesShapeNotExistForEdges) {
                keys.push((_o = {}, _o[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'shape', _o[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'string', _o[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "edge", _o[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'shape', _o));
            }
            if (doesWeightNotExistForEdges) {
                keys.push((_p = {}, _p[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'weight', _p[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'float', _p[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "edge", _p[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'weight', _p));
            }
            if (doesThicknessNotExistForEdges) {
                keys.push((_q = {}, _q[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'thickness', _q[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'float', _q[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "edge", _q[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'thickness', _q));
            }
            // We need to set the r, g, and b values for the nodes and the edges
            if (doesColorNotExistForNodes) {
                keys.push((_r = {},
                    _r[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'r',
                    _r[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'int',
                    _r[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "node",
                    _r[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'r',
                    _r), (_s = {},
                    _s[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'g',
                    _s[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'int',
                    _s[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "node",
                    _s[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'g',
                    _s), (_t = {},
                    _t[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'b',
                    _t[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'int',
                    _t[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "node",
                    _t[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'b',
                    _t));
            }
            if (doesColorNotExistForEdges) {
                keys.push((_u = {},
                    _u[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'r',
                    _u[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'int',
                    _u[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "edge",
                    _u[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'r',
                    _u), (_v = {},
                    _v[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'g',
                    _v[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'int',
                    _v[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "edge",
                    _v[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'g',
                    _v), (_w = {},
                    _w[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"] = 'b',
                    _w[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"] = 'int',
                    _w[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = "edge",
                    _w[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = 'b',
                    _w));
            }
            // The root element
            var root = {
                "?xml": (_x = {},
                    _x[GraphFormatConverter.parserOptions.attributeNamePrefix + "version"] = "1.0",
                    _x[GraphFormatConverter.parserOptions.attributeNamePrefix + "encoding"] = "UTF-8",
                    _x),
                "graphml": (_y = {
                        key: keys,
                        "graph": (_z = {
                                node: nodes,
                                edge: edges
                            },
                            // If the edgeType is mutual we need to treat it as 'directed'
                            _z[GraphFormatConverter.parserOptions.attributeNamePrefix + "edgedefault"] = _this.graphAttributes.edgeType === "mutual" ? "directed" : _this.graphAttributes.edgeType,
                            _z[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = _this.graphAttributes.id,
                            _z)
                    },
                    _y[GraphFormatConverter.parserOptions.attributeNamePrefix + "xmlns"] = "http://graphml.graphdrawing.org/xmlns",
                    _y[GraphFormatConverter.parserOptions.attributeNamePrefix + "xmlns:y"] = "http://www.yworks.com/xml/graphml",
                    _y)
            };
            // Build the document
            var builder = new fast_xml_parser_1.XMLBuilder(GraphFormatConverter.builderOptions);
            // Return the XML built and "fix" the <?xml ... /></?xml> to <?xml ... ?> and replace the backspace chars
            return builder.build(root).replace(/><\/\?xml>/, "?>").replace("\b", "");
        };
        /**
         * Get the nodes of the graph on a JSON format
         * @return any[] The nodes of the graph
         */
        this.getNodes = function () {
            return _this.nodes;
        };
        /**
         * Get the edges of the graph on a JSON format
         * @return any[] The edges of the graph
         */
        this.getEdges = function () {
            return _this.edges;
        };
        /**
         * Get the attributes of the graph on a JSON format
         * @return any[] The attributes of the graph
         */
        this.getAttributes = function () {
            return _this.graphAttributes;
        };
    }
    /**
     * Get the type possibilities of a attribute
     * @param key The key of the attribute
     * @param value The value of the attribute to try to guess the type of
     * @param attributesObject The attribute object contain the attributes and their type's count
     */
    GraphFormatConverter.guessJSONAttribute = function (key, value, attributesObject) {
        // If the key does not exists
        if (attributesObject[key] === undefined) {
            attributesObject[key] = {
                id: key,
                title: key,
                type: {}
            };
        }
        // Now we get the type and if does not exist we create the counter
        if (attributesObject[key].type[typeof value] === undefined) {
            attributesObject[key].type[typeof value] = 0;
        }
        // Add one to this type
        attributesObject[key].type[typeof value] += 1;
    };
    /**
     * The options of the parser
     */
    GraphFormatConverter.parserOptions = {
        ignoreAttributes: false,
        attributeNamePrefix: "@_@_@_",
        allowBooleanAttributes: true,
        removeNSPrefix: true,
        parseAttributeValue: true,
        format: true
    };
    /**
     * The options of the builder
     */
    GraphFormatConverter.builderOptions = {
        ignoreAttributes: false,
        attributeNamePrefix: "@_@_@_",
        allowBooleanAttributes: true,
        suppressBooleanAttributes: false,
        removeNSPrefix: true,
        parseAttributeValue: true,
        format: true
    };
    /**
     * Create a graph from a JSON set of nodes and edges
     * @param graphData The data of the graph as JSON
     * @return GraphFormatConverter The Graph from the JSON graph data
     */
    GraphFormatConverter.fromJson = function (graphData) {
        // The objects that will contain the attributes of the nodes and edges
        var nodeAttributesObject = {};
        var edgeAttributesObject = {};
        /**
         * Function to reorganize the attributes of an element and function used to get the attributes of the nodes/edges
         */
        var reorganizeAttributesOfElements = function (elements, isNode) {
            return elements.map(function (element) {
                // If there is no attributes we add an empty object
                if (element.attributes === undefined) {
                    element.attributes = {};
                }
                // Else we need to keep use this attribute to guess the type of the element attribute
                else {
                    Object.entries(element.attributes).forEach(function (_a) {
                        var key = _a[0], value = _a[1];
                        GraphFormatConverter.guessJSONAttribute(key, value, isNode ? nodeAttributesObject : edgeAttributesObject);
                    });
                }
                // If the color is set, we keep it as a tinycolor2 color
                if (element.color !== undefined) {
                    element.color = (0, tinycolor2_1.default)(element.color);
                }
                // We need to rearrange the attributes of the element and put them in the element.attributes object
                for (var elementKey in element) {
                    // We have some keys we do not want to bother with
                    if (elementKey !== "attributes" && elementKey !== "color" && elementKey !== "id" && elementKey !== "source" && elementKey !== "target") {
                        GraphFormatConverter.guessJSONAttribute(elementKey, element[elementKey], isNode ? nodeAttributesObject : edgeAttributesObject);
                    }
                    // There are some key that should not be in the attributes object
                    if (elementKey !== "attributes" && elementKey !== "color" && elementKey !== "id" && elementKey !== "size" && elementKey !== "weight" && elementKey !== "target" && elementKey !== "source" && elementKey !== "label" && elementKey !== "edgelabel" && elementKey !== "shape" && elementKey !== "x" && elementKey !== "y" && elementKey !== "z") {
                        // If the value is not undefined we can use it
                        if (element[elementKey] !== undefined) {
                            element.attributes[elementKey] = element[elementKey];
                        }
                        delete element[elementKey];
                    }
                }
                // If there is the attribute size for an edge it needs to be weight as size is only of the nodes but sometimes we use size for edges as well
                if (!isNode && element.size !== undefined) {
                    element.weight = element.size;
                    delete element.size;
                }
                return element;
            });
        };
        // Rearrange the nodes and the edges
        graphData.nodes = reorganizeAttributesOfElements(graphData.nodes, true);
        graphData.edges = reorganizeAttributesOfElements(graphData.edges, false);
        // Now we can create the array of attributes
        var nodeAttributes = GraphFormatConverter.getAttributesFromGuesser(nodeAttributesObject);
        var edgeAttributes = GraphFormatConverter.getAttributesFromGuesser(edgeAttributesObject);
        // We set the most generic graph attributes possible
        if (graphData.attributes === undefined) {
            graphData.attributes = {
                id: "graph",
                edgeType: "undirected",
                mode: "static"
            };
        }
        var graphAttributes = {
            id: graphData.attributes.id !== undefined ? graphData.attributes.id : "graph",
            edgeType: graphData.attributes.edgeType !== undefined ? graphData.attributes.edgeType : "undirected",
            mode: graphData.attributes.mode !== undefined ? graphData.attributes.mode : "static"
        };
        // Return the GraphFormatConverter
        return new GraphFormatConverter(graphData.nodes, graphData.edges, nodeAttributes, edgeAttributes, graphAttributes);
    };
    /**
     * Create a graph
     * @param graphData
     * @return GraphFormatConverter The Graph from the Graphology JSON graph data
     */
    GraphFormatConverter.fromGraphology = function (graphData) {
        // The graphology JSON graph representation is a bit tricky as it does not follow the "Gephi convention"
        graphData.nodes = graphData.nodes.map(function (node) {
            return __assign({ id: node.key }, node.attributes);
        });
        graphData.edges = graphData.edges.map(function (edge) {
            return __assign({ id: edge.key, source: edge.source, target: edge.target, undirected: edge.undirected }, edge.attributes);
        });
        // Now return the graph as it would be in JSON
        return GraphFormatConverter.fromJson(graphData);
    };
    /**
     * Create a graph from a GEXF string
     * @param graphData The data of the graph as GEXF
     * @return GraphFormatConverter The Graph from the GEXF graph data
     */
    GraphFormatConverter.fromGexf = function (graphData) {
        // We use a try/catch for the parser to know if the XML string is correct or not
        var parser = new fast_xml_parser_1.XMLParser(GraphFormatConverter.parserOptions);
        var parsedResult;
        try {
            parsedResult = parser.parse(graphData);
        }
        catch (e) {
            throw new Error("An error occurred while trying to parse the XML string: " + e);
        }
        // When the string is parsed we can work on it
        try {
            // First we want to gather the attributes
            var nodeAttributes = [];
            var edgeAttributes = [];
            if (parsedResult.gexf.graph.attributes !== undefined) {
                // If there is only one attribute we will get an object instead of an array of objects, thus we need to convert it to an array
                var attributesArray = parsedResult.gexf.graph.attributes;
                if (!Array.isArray(attributesArray)) {
                    attributesArray = [attributesArray];
                }
                // Get the nodes/edges attributes
                nodeAttributes = GraphFormatConverter.getAttributesDefinitionAsObject(attributesArray.find(function (attribute) { return attribute[GraphFormatConverter.parserOptions.attributeNamePrefix + "class"] === "node"; }));
                edgeAttributes = GraphFormatConverter.getAttributesDefinitionAsObject(attributesArray.find(function (attribute) { return attribute[GraphFormatConverter.parserOptions.attributeNamePrefix + "class"] === "edge"; }));
            }
            // Then we gather the graph attributes
            var graphAttributes = { id: "graph", edgeType: "undirected", mode: "static" };
            // Try to get the id
            if (parsedResult.gexf.graph[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] !== undefined) {
                graphAttributes.id = parsedResult.gexf.graph[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"];
            }
            // Try to get the edge type
            if (parsedResult.gexf.graph[GraphFormatConverter.parserOptions.attributeNamePrefix + "defaultedgetype"] !== undefined) {
                graphAttributes.edgeType = parsedResult.gexf.graph[GraphFormatConverter.parserOptions.attributeNamePrefix + "defaultedgetype"];
            }
            // Try to get the mode
            if (parsedResult.gexf.graph[GraphFormatConverter.parserOptions.attributeNamePrefix + "mode"] !== undefined) {
                graphAttributes.id = parsedResult.gexf.graph[GraphFormatConverter.parserOptions.attributeNamePrefix + "mode"];
            }
            // Then we want to gather the nodes
            var nodes = parsedResult.gexf.graph.nodes.node.map(GraphFormatConverter.getGexfElementAttributes);
            // Then we want to gather the edges
            var edges = parsedResult.gexf.graph.edges.edge.map(GraphFormatConverter.getGexfElementAttributes);
            // Return the GraphFormatConverter
            return new GraphFormatConverter(nodes, edges, nodeAttributes, edgeAttributes, graphAttributes);
        }
        catch (e) {
            throw new Error("An error has occurred while creating the graph, your file is malformed");
        }
    };
    /**
     * Create a graph from a Graphml string
     * @param graphData The data of the graph as Graphml
     * @return GraphFormatConverter The Graph from the Graphml graph data
     */
    GraphFormatConverter.fromGraphml = function (graphData) {
        // We use a try/catch for the parser to know if the XML string is correct or not
        var parser = new fast_xml_parser_1.XMLParser(GraphFormatConverter.parserOptions);
        var parsedResult;
        try {
            parsedResult = parser.parse(graphData);
        }
        catch (e) {
            throw new Error("An error occurred while trying to parse the XML string: " + e);
        }
        try {
            // When the string is parsed we can work on it
            // First we want to gather the attributes
            var nodeAttributes_1 = [];
            var edgeAttributes_1 = [];
            if (parsedResult.graphml.key !== undefined) {
                // If the keys is an object we make it an array
                var keys = parsedResult.graphml.key;
                if (!Array.isArray(keys)) {
                    keys = [keys];
                }
                // For each key get the attributes for either the nodes or the edges
                keys.forEach(function (key) {
                    // If the key is ID, source or target we do not keep it
                    if (key === "id" || key === "source" || key === "target") {
                        return;
                    }
                    // Create the attribute object
                    var attribute = {
                        id: key[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"],
                        type: GraphFormatConverter.graphmlTypeToJSON(key[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.type"]),
                        title: key[GraphFormatConverter.parserOptions.attributeNamePrefix + "attr.name"],
                    };
                    // If the attribute is about the nodes
                    if (key[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] === "node") {
                        nodeAttributes_1.push(attribute);
                    }
                    // If the attribute is about the edges
                    else if (key[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] === "edge") {
                        edgeAttributes_1.push(attribute);
                    }
                });
            }
            // Then we gather the graph attributes
            var graphAttributes = { edgeType: "undirected", mode: "static", id: "graph" };
            // Get the id
            if (parsedResult.graphml.graph[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] !== undefined) {
                graphAttributes.id = parsedResult.graphml.graph[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"];
            }
            // Get the edge type
            if (parsedResult.graphml.graph[GraphFormatConverter.parserOptions.attributeNamePrefix + "edgedefault"] !== undefined) {
                graphAttributes.edgeType = parsedResult.graphml.graph[GraphFormatConverter.parserOptions.attributeNamePrefix + "edgedefault"];
            }
            // Then we want to gather the nodes
            var nodes = parsedResult.graphml.graph.node.map(GraphFormatConverter.getGraphmlElementAttributes);
            // Then we want to gather the edges
            var edges = parsedResult.graphml.graph.edge.map(GraphFormatConverter.getGraphmlElementAttributes);
            // Return the GraphFormatConverter
            return new GraphFormatConverter(nodes, edges, nodeAttributes_1, edgeAttributes_1, graphAttributes);
        }
        catch (e) {
            throw new Error("An error has occurred while creating the graph, your file is malformed");
        }
    };
    /**
     * Get an element as a GRAPHML 'fast-xml-parser' JSON object
     * @param element The element
     */
    GraphFormatConverter.getElementAsGraphmlJSON = function (element) {
        // The element as an object
        var elementObject = {
            "data": []
        };
        // For each attribute we want to get it a formatted JSON
        Object.entries(element).forEach(function (_a) {
            var _b, _c, _d, _e;
            var key = _a[0], value = _a[1];
            // Switch the name of the attribute to format the object
            switch (key) {
                // If the value is the attributes we create a tree for it
                case "attributes":
                    Object.entries(value).forEach(function (_a) {
                        var _b;
                        var elementKey = _a[0], elementValue = _a[1];
                        elementObject.data.push((_b = {},
                            _b[GraphFormatConverter.parserOptions.attributeNamePrefix + "key"] = elementKey,
                            _b["#text"] = ("" + elementValue).replace(new RegExp(/&/, 'g'), "&amp;"),
                            _b));
                    });
                    break;
                case "id":
                    elementObject[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = value;
                    break;
                case "source":
                    elementObject[GraphFormatConverter.parserOptions.attributeNamePrefix + "source"] = value;
                    break;
                case "target":
                    elementObject[GraphFormatConverter.parserOptions.attributeNamePrefix + "target"] = value;
                    break;
                case "color":
                    elementObject.data.push((_b = {}, _b[GraphFormatConverter.parserOptions.attributeNamePrefix + "key"] = "r", _b["#text"] = (0, tinycolor2_1.default)(value).toRgb().r, _b));
                    elementObject.data.push((_c = {}, _c[GraphFormatConverter.parserOptions.attributeNamePrefix + "key"] = "g", _c["#text"] = (0, tinycolor2_1.default)(value).toRgb().g, _c));
                    elementObject.data.push((_d = {}, _d[GraphFormatConverter.parserOptions.attributeNamePrefix + "key"] = "b", _d["#text"] = (0, tinycolor2_1.default)(value).toRgb().b, _d));
                    break;
                default:
                    elementObject.data.push((_e = {},
                        _e[GraphFormatConverter.parserOptions.attributeNamePrefix + "key"] = key,
                        _e['#text'] = ("" + value).replace(new RegExp(/&/, 'g'), "&amp;"),
                        _e));
                    break;
            }
        });
        return elementObject;
    };
    /**
     * Get an element as a GRAPHML 'fast-xml-parser' JSON object
     * @param element The element
     */
    GraphFormatConverter.getElementAsYedGraphmlJSON = function (element) {
        // The element as an object
        var elementObject = {
            "data": []
        };
        // For each attribute we want to get it a formatted JSON
        Object.entries(element).forEach(function (_a) {
            var _b, _c, _d, _e, _f, _g;
            var key = _a[0], value = _a[1];
            // Switch the name of the attribute to format the object
            switch (key) {
                // If the value is the attributes we create a tree for it
                case "attributes":
                    Object.entries(value).forEach(function (_a) {
                        var _b;
                        var elementKey = _a[0], elementValue = _a[1];
                        elementObject.data.push((_b = {},
                            _b[GraphFormatConverter.parserOptions.attributeNamePrefix + "key"] = elementKey,
                            _b["#text"] = ("" + elementValue).replace(new RegExp(/&/, 'g'), "&amp;"),
                            _b));
                    });
                    break;
                case "id":
                    elementObject[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] = value;
                    break;
                case "source":
                    elementObject[GraphFormatConverter.parserOptions.attributeNamePrefix + "source"] = value;
                    break;
                case "target":
                    elementObject[GraphFormatConverter.parserOptions.attributeNamePrefix + "target"] = value;
                    break;
                case "color":
                    elementObject.data.push((_b = {}, _b[GraphFormatConverter.parserOptions.attributeNamePrefix + "key"] = "r", _b["#text"] = (0, tinycolor2_1.default)(value).toRgb().r, _b));
                    elementObject.data.push((_c = {}, _c[GraphFormatConverter.parserOptions.attributeNamePrefix + "key"] = "g", _c["#text"] = (0, tinycolor2_1.default)(value).toRgb().g, _c));
                    elementObject.data.push((_d = {}, _d[GraphFormatConverter.parserOptions.attributeNamePrefix + "key"] = "b", _d["#text"] = (0, tinycolor2_1.default)(value).toRgb().b, _d));
                    break;
                case "label":
                    elementObject.data.push((_e = {},
                        _e[GraphFormatConverter.parserOptions.attributeNamePrefix + "key"] = element.source ? 'd9' : 'd4',
                        _e[element.source ? 'y:PolyLineEdge' : 'y:ShapeNode'] = (_f = {},
                            _f[element.source ? 'y:EdgeLabel' : 'y:NodeLabel'] = {
                                '#text': ("" + value).replace(new RegExp(/&/, 'g'), "&amp;"),
                            },
                            _f),
                        _e));
                    break;
                default:
                    elementObject.data.push((_g = {},
                        _g[GraphFormatConverter.parserOptions.attributeNamePrefix + "key"] = key,
                        _g['#text'] = ("" + value).replace(new RegExp(/&/, 'g'), "&amp;"),
                        _g));
                    break;
            }
        });
        return elementObject;
    };
    /**
     * Get an element as a GEXF 'fast-xml-parser' JSON object
     * @param element The element
     */
    GraphFormatConverter.getElementAsGexfJSON = function (element) {
        // The element as an object
        var elementObject = {
            "attvalues": {
                "attvalue": []
            }
        };
        // For each attribute we want to get it a formatted JSON
        Object.entries(element).forEach(function (_a) {
            var _b, _c, _d, _e;
            var key = _a[0], value = _a[1];
            // If the value is the attributes we create a tree for it
            switch (key) {
                // If the value is the attributes we create a tree for it
                case "attributes":
                    Object.entries(value).forEach(function (_a) {
                        var _b;
                        var elementKey = _a[0], elementValue = _a[1];
                        elementObject.attvalues.attvalue.push((_b = {},
                            _b[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"] = elementKey,
                            _b[GraphFormatConverter.parserOptions.attributeNamePrefix + "value"] = ("" + elementValue).replace(new RegExp(/&/, 'g'), "&amp;"),
                            _b));
                    });
                    break;
                case "size":
                    elementObject["viz:size"] = (_b = {},
                        _b[GraphFormatConverter.parserOptions.attributeNamePrefix + "value"] = value,
                        _b);
                    break;
                case "shape":
                    elementObject["viz:shape"] = (_c = {},
                        _c[GraphFormatConverter.parserOptions.attributeNamePrefix + "value"] = value,
                        _c);
                    break;
                case "thickness":
                    elementObject["viz:thickness"] = (_d = {},
                        _d[GraphFormatConverter.parserOptions.attributeNamePrefix + "value"] = value,
                        _d);
                    break;
                case "color":
                    elementObject["viz:color"] = (_e = {},
                        _e[GraphFormatConverter.parserOptions.attributeNamePrefix + "r"] = (0, tinycolor2_1.default)(value).toRgb().r,
                        _e[GraphFormatConverter.parserOptions.attributeNamePrefix + "g"] = (0, tinycolor2_1.default)(value).toRgb().g,
                        _e[GraphFormatConverter.parserOptions.attributeNamePrefix + "b"] = (0, tinycolor2_1.default)(value).toRgb().b,
                        _e);
                    break;
                // The position is set in an other way
                case "x":
                case "y":
                case "z":
                    break;
                default:
                    elementObject["" + GraphFormatConverter.parserOptions.attributeNamePrefix + key] = Number.isNaN(value) ? value.replace('&', "&amp;") : value;
                    break;
            }
        });
        // Now we can set the position
        elementObject["viz:position"] = {};
        if (element.x !== undefined) {
            elementObject["viz:position"][GraphFormatConverter.parserOptions.attributeNamePrefix + "x"] = element.x;
        }
        if (element.y !== undefined) {
            elementObject["viz:position"][GraphFormatConverter.parserOptions.attributeNamePrefix + "y"] = element.y;
        }
        if (element.z !== undefined) {
            elementObject["viz:position"][GraphFormatConverter.parserOptions.attributeNamePrefix + "z"] = element.z;
        }
        // If there is no position we remove it as it cannot be empty
        if (Object.keys(elementObject["viz:position"]).length === 0) {
            delete elementObject["viz:position"];
        }
        return elementObject;
    };
    /**
     * Get the JSON type of a GEXF type
     * @param type The GEXF type
     */
    GraphFormatConverter.gexfTypeToJSON = function (type) {
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
    };
    /**
     * Get the GEXF type of a JSON type
     * @param type The JSON type
     */
    GraphFormatConverter.jsonTypeToGEXF = function (type) {
        switch (type) {
            case "number":
                return "double";
            case "boolean":
                return "boolean";
            default:
                return "string";
        }
    };
    /**
     * Get the JSON type of a GRAPHML type
     * @param type The GRAPHML type
     */
    GraphFormatConverter.graphmlTypeToJSON = function (type) {
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
    };
    /**
     * Get the GRAPHML type of a JSON type
     * @param type The JSON type
     */
    GraphFormatConverter.jsonTypeToGRAPHML = function (type) {
        switch (type) {
            case "number":
                return "double";
            case "boolean":
                return "boolean";
            default:
                return "string";
        }
    };
    /**
     * Get the attributes of the nodes/edges from the attributesObject gathered by the function 'guessJSONAttribute'
     * @param attributesObject The attributes object
     */
    GraphFormatConverter.getAttributesFromGuesser = function (attributesObject) {
        return Object.values(attributesObject).map(function (value) {
            return {
                id: value.id,
                title: value.title,
                type: Object.entries(value.type).reduce(function (acc, _a) {
                    var typeKey = _a[0], typeValue = _a[1];
                    // If the accumulator is undefined we set it as the first value
                    if (acc === undefined) {
                        return { type: typeKey, count: typeValue };
                    }
                    // Else we want to know which is bigger between the typeValue and the value of the accumulator
                    if (typeValue > acc.count) {
                        return { type: typeKey, count: typeValue };
                    }
                    // Else return the accumulator
                    return acc;
                }, undefined).type
            };
        });
    };
    /**
     * Get the attributes as a array of objects
     * @param attributes The attributes
     */
    GraphFormatConverter.getAttributesDefinitionAsObject = function (attributes) {
        // if the attributes exist we can get them as an array of objects
        if (attributes !== undefined) {
            // If there is only one attribute we will get an object instead of an array of objects, thus we need to convert it to an array
            var attributesArray = attributes.attribute;
            if (!Array.isArray(attributesArray)) {
                attributesArray = [attributesArray];
            }
            // If the id is "id" we do not add it
            return attributesArray.filter(function (attribute) { return attribute[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] !== "id" && attribute[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] !== "source" && attribute[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"] !== "target"; }).map(function (attribute) {
                return {
                    id: attribute[GraphFormatConverter.parserOptions.attributeNamePrefix + "id"],
                    title: attribute[GraphFormatConverter.parserOptions.attributeNamePrefix + "title"],
                    type: GraphFormatConverter.gexfTypeToJSON(attribute[GraphFormatConverter.parserOptions.attributeNamePrefix + "type"]),
                };
            });
        }
        // Otherwise return an empty array
        else {
            return [];
        }
    };
    /**
     * Get the attributes (as well as nested attributes of an element) from a GEXF element
     * @param element The element to gather the attributes of
     */
    GraphFormatConverter.getGexfElementAttributes = function (element) {
        // The object that will contain the attributes
        var elementData = { attributes: {} };
        // For each attribute we want to act differently
        Object.entries(element).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            // If the current value is the attributes
            if (key === "attvalues") {
                // If there is only one attribute we will get an object instead of an array of objects, thus we need to convert it to an array
                var attributesArray = value["attvalue"];
                if (!Array.isArray(attributesArray)) {
                    attributesArray = [attributesArray];
                }
                attributesArray.forEach(function (attributeObject) {
                    elementData.attributes[attributeObject[GraphFormatConverter.parserOptions.attributeNamePrefix + "for"]] = attributeObject[GraphFormatConverter.parserOptions.attributeNamePrefix + "value"];
                });
            }
            // If the key does contain the GraphFormatConverter.options.attributeNamePrefix prefix
            else if (key.includes(GraphFormatConverter.parserOptions.attributeNamePrefix)) {
                elementData[key.replace(GraphFormatConverter.parserOptions.attributeNamePrefix, '')] = value;
            }
            // Else we have some cases that need to be treated separately
            else {
                switch (key) {
                    case "color":
                        elementData.color = (0, tinycolor2_1.default)("rgb(" + value[GraphFormatConverter.parserOptions.attributeNamePrefix + "r"] + ", " + value[GraphFormatConverter.parserOptions.attributeNamePrefix + "g"] + ", " + value[GraphFormatConverter.parserOptions.attributeNamePrefix + "b"] + ")");
                        break;
                    case "position":
                        elementData.x = Number(value[GraphFormatConverter.parserOptions.attributeNamePrefix + "x"]);
                        elementData.y = Number(value[GraphFormatConverter.parserOptions.attributeNamePrefix + "y"]);
                        if (value[GraphFormatConverter.parserOptions.attributeNamePrefix + "z"] !== undefined) {
                            elementData.z = Number(value[GraphFormatConverter.parserOptions.attributeNamePrefix + "z"]);
                        }
                        break;
                    case "size":
                        elementData.size = Number(value[GraphFormatConverter.parserOptions.attributeNamePrefix + "value"]);
                        break;
                    case "thickness":
                        elementData.size = Number(value[GraphFormatConverter.parserOptions.attributeNamePrefix + "value"]);
                        break;
                    case "shape":
                        elementData.size = Number(value[GraphFormatConverter.parserOptions.attributeNamePrefix + "value"]);
                        break;
                    default:
                        elementData[key] = value;
                        break;
                }
            }
        });
        return elementData;
    };
    /**
     * Get the attributes (as well as nested attributes of an element) from a Graphml element
     * @param element The element to gather the attributes of
     */
    GraphFormatConverter.getGraphmlElementAttributes = function (element) {
        // The object that will contain the attributes
        var elementData = { attributes: {} };
        // For each attribute we want to act differently
        Object.entries(element).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            // If the current value is the attributes
            if (key === "data") {
                // If there is only one attribute we will get an object instead of an array of objects, thus we need to convert it to an array
                var attributesArray = value;
                if (!Array.isArray(attributesArray)) {
                    attributesArray = [attributesArray];
                }
                attributesArray.forEach(function (attributeObject) {
                    elementData.attributes[attributeObject[GraphFormatConverter.parserOptions.attributeNamePrefix + "key"]] = attributeObject["#text"];
                });
            }
            // If the key does contain the GraphFormatConverter.options.attributeNamePrefix prefix
            else if (key.includes(GraphFormatConverter.parserOptions.attributeNamePrefix)) {
                elementData[key.replace(GraphFormatConverter.parserOptions.attributeNamePrefix, '')] = value;
            }
        });
        // For the color (fields r, g and b) we want to remove them and set color
        if (elementData.attributes.r !== undefined && elementData.attributes.g !== undefined && elementData.attributes.b !== undefined) {
            elementData.color = (0, tinycolor2_1.default)("rgb(" + elementData.attributes.r + ", " + elementData.attributes.g + ", " + elementData.attributes.b + ")");
            delete elementData.attributes.r;
            delete elementData.attributes.g;
            delete elementData.attributes.b;
        }
        // We need to set the position to the "main" attributes
        if (elementData.attributes.x !== undefined) {
            elementData.x = elementData.attributes.x;
            delete elementData.attributes.x;
        }
        if (elementData.attributes.y !== undefined) {
            elementData.y = elementData.attributes.y;
            delete elementData.attributes.y;
        }
        if (elementData.attributes.x !== undefined) {
            elementData.z = elementData.attributes.z;
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
    };
    return GraphFormatConverter;
}());
exports.GraphFormatConverter = GraphFormatConverter;
//# sourceMappingURL=GraphFormatConverter.js.map