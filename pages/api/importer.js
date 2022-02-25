import * as cheerio from "cheerio";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';

const importer = async ( req, res ) => {
    const response = await axios.get(
        "https://www.travelwithcarlo.com/post/96-hour-city-guide-zurich-switzerland"
    );
    const $ = cheerio.load( response.data );
    const allNodes = [];
    $( "h1, h2, h3, img, p" ).each( function ( i, elm ) {
        const currentTag = $( this )[0].name;
        const nodeInfo = {
            tag: currentTag,
        };
        // console.log(currentTag);
        if ( currentTag == "img" ) {
            //console.log($(this).attr('src'));
            nodeInfo["src"] = $( this ).attr( "src" );
        } else {
            const isAtag = $( this ).find( "a" );
            if ( isAtag.length > 0 ) {
                nodeInfo["tag"] = "href";
                nodeInfo["href"] = isAtag.attr( "href" );
                nodeInfo["title"] = isAtag.text();
            }
            nodeInfo["text"] = $( this ).text().trim();
        }
        allNodes.push( nodeInfo );
    } );

    // remove price policy element
    allNodes.pop();

    const titleIndex = allNodes.findIndex( ( item ) => item.tag == "h1" );
    const data = {
        blocks: [],
        nodes: [],
    };
    if ( titleIndex > -1 ) {
        data["name"] = allNodes[titleIndex].text;
        allNodes.splice( 0, titleIndex + 1 );
    }
    // console.log( allNodes );
    const coverPhotoIndex = allNodes.findIndex( ( item ) => item.tag == "img" );
    if ( coverPhotoIndex > -1 ) {
        data["image"] = allNodes[coverPhotoIndex].src;
        allNodes.splice( 0, coverPhotoIndex + 1 );
    }
    allNodes.forEach( ( value, index ) => {
        const uuid = uuidv4();
        const boardId = "someId";
        const boardNode = {
            id: 0,
            uuid: uuid,
            board: boardId,
            lockVersion: null
        }
        switch ( value.tag ) {
            case "h1":
                boardNode["type"] = "text"
                boardNode["style"] = "heading1"
                boardNode["text"] = "\u0000" + value.text
                break;
            case "h2":
                boardNode["type"] = "text"
                boardNode["style"] = "heading2"
                boardNode["text"] = "\u0000" + value.text
                break;
            case "h3":
                boardNode["type"] = "text"
                boardNode["style"] = "heading3"
                boardNode["text"] = "\u0000" + value.text
                break;
            case "p":
                boardNode["type"] = "text"
                boardNode["style"] = "body1"
                boardNode["text"] = "\u0000" + value.text
                break;
            case "img":
                const spaceUuid = uuidv4();
                const spaceNode = {
                    "id": 0,
                    "board": boardId,
                    "uid": spaceUuid,
                    "type": "text",
                    "lockVersion": null,
                    "style": "body1",
                    "text": ""
                }
                data.blocks.push( spaceUuid );
                data.nodes.push( spaceNode );
                boardNode["type"] = "photo"
                boardNode["url"] = value.src
                break;
            case "href":
                boardNode["type"] = "link"
                boardNode["link"] = value.href
                boardNode["title"] = value.text
                break;

        }
        data.blocks.push( uuid );
        data.nodes.push( boardNode );
    } );
    console.log( allNodes );
    res.statusCode = 200;
    res.setHeader( "Content-Type", "application/json" );
    res.end( JSON.stringify( data, null, 4 ) );
};

export default importer;
