module GovukPublishingComponents
  module AppHelpers
    class StepNav
      def initialize(content_item)
        @content_item = content_item.deep_symbolize_keys
      end

      def title
        content_item[:title]
      end

      def base_path
        content_item[:base_path]
      end

      def content
        content_item.dig(:details, :step_by_step_nav)
      end

      def steps
        content_item.dig(:details, :step_by_step_nav, :steps)
      end

    private

      attr_reader :content_item
    end
  end
end