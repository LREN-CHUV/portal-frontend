import * as React from 'react';

const code = `
window.addEventListener("load", function(){
    var script = document.createElement('script');
    script.src = "https://support.humanbrainproject.eu/assets/form/form.js";
    script.id = "zammad_form_script";
    document.body.appendChild(script);
    script.addEventListener("load", function() {
        $(function () {
            $('#feedback-form').ZammadForm({
                messageTitle: 'Feedback Form',
                messageSubmit: 'Submit',
                messageThankYou: 'Thank you for your inquiry (#%s)! We will contact you as soon as possible.'
            });
        });
        setTimeout(function() {
          var preselect = document.querySelector('[name="hbp-category"] option[value="Medical Informatics"]');
          preselect.selected = "selected";
        }, 200);

    });
});
`;

export default class Helpdesk extends React.PureComponent {
  public componentDidMount() {
    const script1 = document.createElement('script');
    script1.src =
      'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js';
    document.head.appendChild(script1);

    const script = document.createElement('script');
    script.text = code;
    document.head.appendChild(script);
  }

  public render = () => (
    <div>
      <div id="feedback-form" />
    </div>
  );
}
