from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage
from dotenv import load_dotenv
from langgraph.graph import StateGraph, START, END
from typing_extensions import TypedDict
import json

load_dotenv()
LLM_NAME = 'gpt-4'
llm = ChatOpenAI(model_name=LLM_NAME)

class State(TypedDict):
    chat_history: list[str]
    type: str
    success: bool
    originLocationCode: str
    destinationLocationCode: str
    departureDate: str
    adults: str
    number: str

def append_chat_history(prompt, chat_history):
    for i in range(len(chat_history)):
        if i%2 == 0:
            prompt += "human : " +chat_history[i] + '\n'
        else:
            prompt += "chatbot : " + chat_history[i] + '\n'
    return prompt

def classify_type(state: State):
    prompt = '''
        You are tasked with analyzing user questions in a chatbot-based airline booking system.
        Your job is to identify the type of the last user question based on the conversation history.

        Below are the types of questions:
        "search": Flight Search Questions
        "booking with number": Flight Booking Questions with candidates
        "cancel": Flight Cancellation Questions
        "list": Flight Reservation List Questions
        
        IMPORTANT:
        The conversation history may include various types of scenarios.
        For example, a user might search for a flight and then ask for a reservation list, or cancel a booking and then proceed to search for flights.
        In such cases, you must identify and return the type of the last user question in the conversation history.
        Always return only the type of the most recent question, and no other information.

        Return only type name ex: search, booking with number, cancel, list

        Below are the chat_history:

    '''
    prompt = append_chat_history(prompt, state['chat_history'])
    response = llm.invoke([SystemMessage(prompt)])
    return {'type': response.content, 'chat_history': state['chat_history']}

def extract_search(state: State):
    prompt = '''
        You are tasked with analyzing user questions in a chatbot-based airline booking system.
        Your job is to extract the value from the conversation history.

        Below are the values:
        1. originLocationCode : (IATA code for departure location, e.g., SYD)
        2. destinationLocationCode : (IATA code for arrival location, e.g., BKK)
        3. departureDate : (Departure date in the format YYYY-MM-DD, e.g., 2023-05-02)
        4. adults : (Number of passengers, e.g., 3)
        
        Return in json form.
        ex: {"originLocationCode": "SYD", "destinationLocationCode": "BKK", "departureDate": "2023-05-02", "adults": 3}

        IMPORTANT: 
        1. If you can not resolve value from the conversation history, then set 'false' value.
        2. If you want to set 0 in "adults" value, instead set "false".
        ex: {"originLocationCode": "SYD", "destinationLocationCode": "BKK", "departureDate": "false", "adults": "false"}
        Below are the chat_history:
        3. The values you are tasked with extracting may appear multiple times in the conversation history.
           In such cases, you should determine which value to extract based on the context of the conversation.
           Generally, the most recent value from the conversation is used, unless the context suggests otherwise.
           Always use your judgment based on the conversation history to select the appropriate value to return.

    '''
    prompt = append_chat_history(prompt, state['chat_history'])
    response = llm.invoke([SystemMessage(prompt)])
    dic = json.loads(response.content)
    success = 'false' in dic.values()
    return {type: state['type'], 'success': not success} | dic

def extract_booking_with_number(state: State):
    prompt = '''
        You are tasked with analyzing user questions in a chatbot-based airline booking system.
        Your job is to extract the value from the conversation history.

        Below are the values:
        1. number : (number of flight in flight list)
        
        Return in json form.
        ex: {"number": 3}

        IMPORTANT: 
        1. If you can not resolve value from the conversation history, then set 'false' value.
        2. Do not set 0 value. instead set 'false'. 
        ex: {"number": "false"}
        3. The values you are tasked with extracting may appear multiple times in the conversation history.
           In such cases, you should determine which value to extract based on the context of the conversation.
           Generally, the most recent value from the conversation is used, unless the context suggests otherwise.
           Always use your judgment based on the conversation history to select the appropriate value to return.

        Below are the chat_history:

    '''
    prompt = append_chat_history(prompt, state['chat_history'])
    response = llm.invoke([SystemMessage(prompt)])
    dic = json.loads(response.content)
    success = 'false' in dic.values()
    return {type: state['type'], 'success': not success} | dic

def extract_cancel(state: State):
    prompt = '''
        You are tasked with analyzing user questions in a chatbot-based airline booking system.
        Your job is to extract the value from the conversation history.

        Below are the values:
        1. number : (number of flight in flight list)
        
        Return in json form.
        ex: {"number": 3}

        IMPORTANT: 
        1. If you can not resolve value from the conversation history, then set 'false' value.
        2. Do not set 0 value. instead set 'false'. 
        ex: {"number": "false"}
        3. The values you are tasked with extracting may appear multiple times in the conversation history.
           In such cases, you should determine which value to extract based on the context of the conversation.
           Generally, the most recent value from the conversation is used, unless the context suggests otherwise.
           Always use your judgment based on the conversation history to select the appropriate value to return.

        Below are the chat_history:

    '''
    prompt = append_chat_history(prompt, state['chat_history'])
    response = llm.invoke([SystemMessage(prompt)])
    dic = json.loads(response.content)
    success = 'false' in dic.values()
    return {type: state['type'], 'success': not success} | dic

def extract_list(state: State):
    return {type: state['type'], 'success': True}

def determine_extract_type(state: State):
    return state['type']

graph = StateGraph(State)

graph.add_node("classify_type", classify_type)
graph.add_node("extract_search", extract_search)
graph.add_node("extract_booking_with_number", extract_booking_with_number)
graph.add_node("extract_cancel", extract_cancel)
graph.add_node("extract_list", extract_list)

graph.add_edge(START, "classify_type")
graph.add_conditional_edges(
    "classify_type",
    determine_extract_type,
    {
        "search": "extract_search",
        "booking with number": "extract_booking_with_number",
        "cancel": "extract_cancel",
        "list": "extract_list"
    }
)
graph.add_edge("extract_search", END)
graph.add_edge("extract_booking_with_number", END)
graph.add_edge("extract_cancel", END)
graph.add_edge("extract_list", END)

app = graph.compile()

class LLM:

    @classmethod
    def invoke(cls, chat_history):
        response = app.invoke({'chat_history': chat_history})
        if response['type'] == 'search':
            ret = {'type': 'search', 'success': response['success']}
            ret |= {'originLocationCode': response['originLocationCode'] if response['originLocationCode'] != 'false' else False}
            ret |= {'destinationLocationCode': response['destinationLocationCode'] if response['destinationLocationCode'] != 'false' else False}
            ret |= {'departureDate': response['departureDate'] if response['departureDate'] != 'false' else False}
            if isinstance(response['adults'], int):
                if response['adults'] == 0:
                    ret |= {'adults': False}
                    ret['success'] = False
                else:
                    ret |= {'adults': response['adults']}
            else:
                ret |= {'adults': False}
            return ret
        elif response['type'] == 'booking with number':
            ret = {'type': 'booking with number', 'success': response['success']}
            if isinstance(response['number'], int):
                if response['number'] == 0:
                    ret |= {'number': False}
                    ret['success'] = False
                else:
                    ret |= {'number': response['number']}
            else:
                ret |= {'number': False}
            return ret
        elif response['type'] == 'cancel':
            ret = {'type': 'cancel', 'success': response['success']}
            if isinstance(response['number'], int):
                if response['number'] == 0:
                    ret |= {'number': False}
                    ret['success'] = False
                else:
                    ret |= {'number': response['number']}
            else:
                ret |= {'number': False}
            return ret
        elif response['type'] == 'list':
            return {'type': 'list', 'success': response['success']}