import json
from aiv1 import LLM as LLMv1
from ai import LLM as LLMv2

data = {}

for type in ['search', 'booking_with_number', 'cancel', 'list', 'mix_type']:
# for type in ['mix_type']:
    with open(type + '.json', 'r', encoding='utf-8') as file:
        data = json.load(file)['data']

    cnt1 = 0
    cnt2 = 0
    for idx, i in enumerate(data):
        chat_history = i['chat_history']
        answer = i['answer']

        responsev1 = LLMv1.invoke(chat_history)
        # responsev1 = 'test'
        responsev2 = LLMv2.invoke(chat_history)

        print(f'{idx+1}:')

        if isinstance(responsev1, str):
            print(f'responsev1: {responsev1}')
            if responsev2 == answer:
                print('X O')
                cnt2 += 1
            else:
                print(f'responsev2: {responsev2}')
                print('X X')
        elif responsev1 == answer:
            if responsev2 == answer:
                print('O O')
                cnt1 += 1
                cnt2 += 1
            else:
                print(f'responsev2: {responsev2}')
                print('O X')
                cnt1 += 1
        elif responsev1 != answer:
            if responsev2 == answer:
                print(f'responsev1: {responsev1}')
                print('X O')
                cnt2 += 1
            else:
                print(f'responsev1: {responsev1}')
                print(f'responsev2: {responsev2}')
                print('X X')
    print(f'cnt1: {cnt1}')
    print(f'cnt2: {cnt2}')
