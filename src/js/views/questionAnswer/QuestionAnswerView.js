import React, {Component, View, Text, TextInput} from 'react-native';
import Path from '../../routing/Path';
import Question from './Question.js';
import AnswerList from './AnswerList.js';
import TypedTransition from '../../routing/TypedTransition';
import ConclusionView from "../conclusion/ConclusionView";
import AppState from "../../hack/AppState"
import * as CHSStyles from "../primitives/GlobalStyles"
import AppHeader from '../primitives/AppHeader';

@Path('/questionAnswer')
class QuestionAnswerView extends Component {
    static propTypes = {
        params: React.PropTypes.object.isRequired
    };

    static contextTypes = {
        navigator: React.PropTypes.func.isRequired,
        getService: React.PropTypes.func.isRequired
    };

    constructor(props, context) {
        super(props, context);
        this.questionnaire = context.getService("questionnaireService").getQuestionnaire(AppState.questionnaireAnswers.questionnaireName);
    }

    toAnswer(questionAnswer) {
        if (questionAnswer.questionDataType === 'Numeric')
            return (<TextInput onChangeText={(text) => AppState.questionnaireAnswers.currentAnswer = text}/>);
        else
            return (<AnswerList answers={this.questionAnswer.answers}/>);
    };

    previousButton(questionAnswer) {
        if (!questionAnswer.isFirstQuestion)
            return (<Text onPress={this.onPrevious}>Previous</Text>);
    };

    onPrevious = () => {
        TypedTransition
            .from(this)
            .with({
                questionNumber: this.props.params.questionNumber - 1
            })
            .to(QuestionAnswerView);
    };

    onNext = () => {
        var typedTransition = TypedTransition.from(this);
        if (this.questionAnswer.isLastQuestion) {
            typedTransition.with().to(ConclusionView);
        } else {
            typedTransition.with({
                    questionNumber: this.props.params.questionNumber + 1
                })
                .to(QuestionAnswerView);
        }
    };

    render() {
        this.questionnaire.setQuestionIndex(this.props.params.questionNumber);
        this.questionAnswer = this.questionnaire.currentQuestion();
        AppState.questionnaireAnswers.currentQuestion = this.questionAnswer.question;
        return (
            <View>
                <AppHeader title={AppState.questionnaireAnswers.questionnaireName} />
                <Question question={this.questionAnswer.question}/>
                {this.toAnswer(this.questionAnswer)}
                {this.previousButton(this.questionAnswer)}
                <Text onPress={this.onNext} style={CHSStyles.Global.navButton}>Next</Text>
            </View>
        );
    }
}

export default QuestionAnswerView;