/*
 * Author: Newton Calegari
 * newton@nic.br
 */

var Token = function(lexema){
    this.lexema = lexema;
    this.tipo = null;
    this.node = null; // {root, adj}
}
Token.prototype = {
    identificar_tipo: function(){
                        if (typeof this.lexema == 'number'){
                            this.tipo = 'num';
                        }
                        else if (typeof this.lexema == 'string') {
                            this.tipo = 'str';
                        }
                        return typeof this.lexema;
                      },

    tipo_node: function(tipo){               
                   this.node = tipo;
               }
}

var Node = function(){
    this.label = null;
}
Node.prototype = {
    create: function(label){
                this.label = label;
            }
}

var Edge = function(){
    this.source = null;
    this.target = null;
}
Edge.prototype = {
    create: function(from, to){
                this.source = from;
                this.target = to;
            }
}

function lexical(val){
    val = val.trim();
    val = val.replace(/^\s*[\r\n]/gm,''); // remove blank lines of textarea value
    lines = val.split('\n');
    for (line in lines){
        lines[line] = lines[line].trim();
        lines[line] = lines[line].replace('=', ',');
        tkns = lines[line].split(',');
        for (tk in tkns){
            tkns[tk] = tkns[tk].trim();
        }
        lines[line] = tkns;
    }

    return lines;
}

function makeNodes(tokens){
    labelList = new Array();
    nodeList = new Array();
    for (token in tokens){
        if (labelList.indexOf(tokens[token].lexema) == -1) {
            labelList.push(tokens[token].lexema);
        }
    }
    for (label in labelList){
        node = new Node();
        node.create(labelList[label]);
        nodeList.push(node);
    }

    return nodeList;
}

function makeEdges(tokens){
    edgeList = new Array();
    for (token in tokens){
        if (tokens[token].node === 'root'){
            node_root = tokens[token];
            cursor = parseInt(token) + 1;
            do {
                edge = new Edge();
                edge.create(node_root.lexema, tokens[cursor].lexema);
                edgeList.push(edge);

                cursor++;
            }while (cursor < tokens.length && tokens[cursor].node === 'adj');
        }
    }

    return edgeList;
}

function parser(action){
    input = document.getElementById('campo');
    output = document.getElementById('output');

    var input_val = input.value;
    
    line_tkns = lexical(input_val);
    tokens = new Array();
    for (line in line_tkns){
        token_root = new Token(line_tkns[line][0]);
        token_root.tipo_node('root');
        tokens.push(token_root);
        for (i = 1; i < line_tkns[line].length; i++){
            token_adj = new Token(line_tkns[line][i]);
            token_adj.tipo_node('adj');
            tokens.push(token_adj);
        }
    }

    nodes = makeNodes(tokens);
    edges = makeEdges(tokens);
    output.innerHTML = '';
    for (edge in edges){
        output.innerHTML += '(' + edges[edge].source + ', ' + edges[edge].target + ') <br />';
    }

    if (action === 'create'){
        makeGraph(nodes, edges);
        document.getElementById('ok').onclick = function(){ parser('update'); };
    }
    else if (action === 'update'){
        updateGraph(graph, nodes, edges);
    }
}

function updateGraph(graph, nodes, edges){
    graph.clear();

    for (node in nodes){
        graph.addNode(nodes[node].label, nodes[node].label);
    }
    for (edge in edges){
        graph.addLink(edges[edge].source, edges[edge].target);
    }

}

function makeGraph(nodes, edges) {
    graph = Viva.Graph.graph();
    var graphics = Viva.Graph.View.svgGraphics(),
        nodeSize = 16;



    graphics.node(function(node){
        var ui = Viva.Graph.svg('g'),
            svgText = Viva.Graph.svg('text')
                                .attr('style', 'fill: #fff; font-weight: normal; font-size: 16px;')
                                .attr('y', '3px')
                                .attr('x', '-4px')
                                .text(node.id),
            nodeCircle = Viva.Graph.svg('circle')
                                    .attr('fill', 'rgb(0, 162, 232)')
                                    .attr('cx', 2)
                                    .attr('cy', -2)
                                    .attr('r', nodeSize);

        ui.append(nodeCircle);
        ui.append(svgText);
        return ui;
    }).placeNode(function(nodeUI, pos){
        nodeUI.attr('transform', 'translate('+(pos.x) + 
                ',' + (pos.y)+')');
    });

    var renderer = Viva.Graph.View.renderer(graph, {
        graphics : graphics,
        container : document.getElementById('graphContainer')
    }); 
    renderer.run();

    for (node in nodes){
        graph.addNode(nodes[node].label, nodes[node].label);
    }
    for (edge in edges){
        graph.addLink(edges[edge].source, edges[edge].target);
    }
   
}
