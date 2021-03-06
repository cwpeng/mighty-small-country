import React from "react";
import Loading from "./ui/Loading.js";
const AppContext=React.createContext();
class AppContextInterface extends React.Component{
	constructor(props){
		super(props);
		this.state={...props, loading:false};

		this.popFromHistoryState=this.popFromHistoryState.bind(this);
		this.pushToHistoryState=this.pushToHistoryState.bind(this);
		this.changePage=this.changePage.bind(this);
	}
	componentDidMount(){
		window.addEventListener("popstate", this.popFromHistoryState);
		this.pushToHistoryState();
	}
	componentWillUnmount(){
		window.removeEventListener("popstate", this.popFromHistoryState);
	}
	popFromHistoryState(e){
		const page=e.state;
		if(page!==null){
			// keep page state without title attribute
			const title=page.title;
			delete page.title;
			this.setState({page}, function(){
				window.document.title=title;
			});
		}
	}
	pushToHistoryState(){
		const page=this.state.page;
		let url="/";
		let title="小國主義";
		if(page.chapter){
			const chapter=this.state.chapters.find((chapter)=>{
				return chapter.key===page.chapter;
			});
			url+="chapter/"+chapter.key;
			title=chapter.title+" - "+title;
		}else if(page.tag){
			url+="tag/"+page.tag;
			title=page.tag+" - "+title;
		}else if(page.story){
			url+="story/"+page.story;
			title=page.storyData.title+" - "+title;
		}
		// add title to page only for history state tracking
		window.document.title=page.title=title;
		window.history.pushState(page, title, url);
		// scroll to top of the page if in story page
		window.document.documentElement.scrollTop=0;
		// send event to Google Analytics
		if(gtag){
			gtag("event", "pageview", {
				"event_category": title,
				"event_label": url
			});
		}
	}
	changePage(e, page){
		e.preventDefault();
		const isSamePage=(page.chapter===this.state.page.chapter && page.tag===this.state.page.tag && page.story===this.state.page.story);
		if(isSamePage){
			return;
		}
		let args;
		if(page.chapter){
			args="chapter="+page.chapter;
		}else if(page.tag){
			args="tag="+page.tag;
		}else if(page.story){
			args="story="+page.story;
		}else{ // homepage
			args="";
		}
		// wait networking and set state
		this.setState({loading:true});
		fetch("/api/story?"+args).then((response)=>{
			return response.json();
		}).then((result)=>{
			page.stories=result.data.stories; // always exists
			page.storyData=result.data.storyData; // maybe undefined
			this.setState({loading:false, page}, this.pushToHistoryState);
		});
	}
	render(){
		const loading=this.state.loading?<Loading/>:undefined;
		return <AppContext.Provider value={{...this.state, changePage:this.changePage}}>
			{this.props.children}
			{loading}
		</AppContext.Provider>;
	}
}
export {AppContextInterface as default, AppContext};